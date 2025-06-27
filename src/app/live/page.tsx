
'use client'; 

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { io, type Socket } from 'socket.io-client';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle as CardTitleComponent } from '@/components/ui/card';
import { MessageSquare, Users, Share2, AlertTriangle, Lock, Loader2, Send, Phone, PhoneOff, Mic, MicOff, Video, VideoOff as VideoOffIconLucide } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getSetting, type LivestreamSettings } from '@/services/settingsService';
import { siteConfig } from '@/config/site';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from "@/hooks/use-toast";
import Link from 'next/link';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle as AlertDialogTitleComponent } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle as DialogTitleComponent, DialogDescription as DialogDescriptionComponent } from '@/components/ui/dialog';

const CardTitle = CardTitleComponent;
const AlertDialogTitle = AlertDialogTitleComponent;
const DialogDescription = DialogDescriptionComponent;
const DialogTitle = DialogTitleComponent;
const USER_SESSION_KEY = 'onlyfansly_user_session';

interface UserSessionData {
  uid: string;
  email: string;
  role?: string;
  isVerified: boolean;
  firstName?: string;
  lastName?: string;
  chatDisplayName?: string;
  canChat?: boolean;
}

interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  text: string;
  timestamp: string;
  isAdmin: boolean;
}

const PC_CONFIG: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    {
      urls: 'turn:global.relay.metered.ca:80',
      username: 'adec321c101830c29b8d5f53',
      credential: 'onjnB9t/tAaZs6km'
    },
    {
      urls: 'turn:global.relay.metered.ca:80?transport=tcp',
      username: 'adec321c101830c29b8d5f53',
      credential: 'onjnB9t/tAaZs6km'
    },
    {
      urls: 'turn:global.relay.metered.ca:443',
      username: 'adec321c101830c29b8d5f53',
      credential: 'onjnB9t/tAaZs6km'
    },
    {
      urls: 'turns:global.relay.metered.ca:443?transport=tcp',
      username: 'adec321c101830c29b8d5f53',
      credential: 'onjnB9t/tAaZs6km'
    }
  ],
};

function LiveStreamEmbed({ streamUrl, title = "Live Stream" }: { streamUrl: string; title?: string; }) {
  const isIframe = (s: string) => s.trim().startsWith('<iframe');
  return (
    <div className="aspect-video w-full max-w-4xl mx-auto rounded-lg overflow-hidden shadow-2xl border border-primary/30">
      {isIframe(streamUrl) ? (
        <div dangerouslySetInnerHTML={{ __html: streamUrl }} className="w-full h-full [&>iframe]:w-full [&>iframe]:h-full" />
      ) : (
        <iframe src={streamUrl} title={title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen className="w-full h-full"></iframe>
      )}
    </div>
  );
}

function WebcamViewer({ socket, onStreamInfo, offlineMessage }: { socket: Socket | null, onStreamInfo: (info: {title:string, subtitle:string} | null) => void, offlineMessage: string}) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
    const [connectionState, setConnectionState] = useState<'idle' | 'connecting' | 'connected' | 'failed'>('idle');
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

    const cleanupConnection = useCallback(() => {
        if (peerConnectionRef.current) {
            peerConnectionRef.current.close();
            peerConnectionRef.current = null;
        }
        if(videoRef.current) videoRef.current.srcObject = null;
        setConnectionState('idle');
        onStreamInfo(null);
        setRemoteStream(null);
    }, [onStreamInfo]);
    
    useEffect(() => {
        if (videoRef.current && remoteStream) {
            videoRef.current.srcObject = remoteStream;
        }
    }, [remoteStream]);


    useEffect(() => {
        if (!socket) return;
        
        const handleOffer = async (data: { offer: RTCSessionDescriptionInit, broadcasterSocketId: string }) => {
            if (!data.offer) return;
            setConnectionState('connecting');

            const pc = new RTCPeerConnection(PC_CONFIG);
            peerConnectionRef.current = pc;
            
            pc.ontrack = (event) => { 
                setRemoteStream(event.streams[0]);
            };
            pc.onicecandidate = (event) => { 
                if (event.candidate) {
                    socket.emit('webrtc:ice-candidate', { targetSocketId: data.broadcasterSocketId, candidate: event.candidate });
                }
            };
            pc.onconnectionstatechange = () => {
                const state = pc.connectionState;
                if(state === 'connected') setConnectionState('connected');
                else if (['failed', 'disconnected', 'closed'].includes(state)) {
                    cleanupConnection();
                }
            };

            try {
                await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);
                socket.emit('viewer:answer-to-broadcaster', { broadcasterSocketId: data.broadcasterSocketId, answer });
            } catch (error) {
                console.error("Error handling offer:", error);
                setConnectionState('failed');
            }
        };

        const handleRemoteCandidate = (data: { candidate: RTCIceCandidateInit }) => {
            if (peerConnectionRef.current?.remoteDescription && data.candidate) {
                peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(data.candidate)).catch(err => {
                    console.error("Error adding received ICE candidate", err);
                });
            }
        };

        socket.on('server:offer-from-broadcaster', handleOffer);
        socket.on('server:general-stream-info', onStreamInfo);
        socket.on('server:general-stream-ended', cleanupConnection);
        socket.on('webrtc:ice-candidate-received', handleRemoteCandidate);

        return () => {
            socket.off('server:offer-from-broadcaster', handleOffer);
            socket.off('server:general-stream-info', onStreamInfo);
            socket.off('server:general-stream-ended', cleanupConnection);
            socket.off('webrtc:ice-candidate-received', handleRemoteCandidate);
            cleanupConnection();
        };
    }, [socket, onStreamInfo, cleanupConnection]);

    return (
        <div className="relative aspect-video w-full max-w-4xl mx-auto rounded-lg overflow-hidden shadow-2xl border border-primary/30 bg-black">
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            {connectionState !== 'connected' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-black/50">
                    {connectionState === 'connecting' && <Loader2 className="h-10 w-10 animate-spin" />}
                    <p className="ml-2 mt-2">
                        {connectionState === 'connecting' ? 'Conectando al stream en vivo...' : offlineMessage}
                    </p>
                </div>
            )}
        </div>
    );
}

function LiveChatBox({ socket, currentUserSession, isChatGloballyEnabled, livestreamSettings }: { socket: Socket | null; currentUserSession: UserSessionData | null; isChatGloballyEnabled: boolean; livestreamSettings: LivestreamSettings | null;}) {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const chatContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (socket && socket.connected) {
      const handleChatHistory = (history: ChatMessage[]) => setChatMessages(history);
      const handleNewMessage = (message: ChatMessage) => setChatMessages(prev => [...prev, message]);
      
      socket.on('CHAT_HISTORY', handleChatHistory);
      socket.on('NEW_CHAT_MESSAGE', handleNewMessage);

      socket.emit('REQUEST_CHAT_HISTORY');

      return () => {
        socket.off('CHAT_HISTORY', handleChatHistory);
        socket.off('NEW_CHAT_MESSAGE', handleNewMessage);
      };
    }
  }, [socket]);

  useEffect(() => {
    if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);
  
  const handleSendMessage = () => {
    if (!socket || !socket.connected || !chatInput.trim()) return;
    socket.emit('SEND_CHAT_MESSAGE', { message: chatInput.trim() });
    setChatInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
    }
  };
  
  let canUserSendMessage = false;
  let chatPlaceholder = "Conectando al chat...";
  const chatMode = livestreamSettings?.chatMode || 'loggedInOnly';

  if (socket && socket.connected) {
      if (!isChatGloballyEnabled) {
          chatPlaceholder = "El chat está deshabilitado.";
      } else if (chatMode === 'loggedInOnly' && !currentUserSession) {
          chatPlaceholder = "Inicia sesión para poder chatear.";
      } else if (currentUserSession && !currentUserSession.isVerified) {
          chatPlaceholder = "Verifica tu cuenta para chatear.";
      } else if (currentUserSession && currentUserSession.canChat === false && currentUserSession.role !== 'admin') {
          chatPlaceholder = "Tu participación ha sido restringida.";
      } else {
          chatPlaceholder = "Escribe tu mensaje...";
          canUserSendMessage = true;
      }
  }


  return (
    <Card className="h-[600px] flex flex-col shadow-lg">
      <CardHeader><CardTitle className="font-headline text-xl flex items-center gap-2 text-accent"><MessageSquare className="h-5 w-5" /> Chat en Vivo</CardTitle></CardHeader>
      <CardContent ref={chatContainerRef} className="flex-grow overflow-y-auto space-y-3 p-4 bg-muted/30 min-h-0 rounded-md">
        {chatMessages.map(msg => (
          <div key={msg.id} className={`flex flex-col ${currentUserSession?.uid === msg.userId ? 'items-end' : 'items-start'}`}>
            <div className={`text-xs mb-0.5 ${msg.isAdmin ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>{msg.userName}</div>
            <div className={`p-2 rounded-lg max-w-[80%] text-sm break-words shadow ${currentUserSession?.uid === msg.userId ? 'bg-primary text-primary-foreground' : msg.isAdmin ? 'bg-accent/20 text-accent-foreground' : 'bg-secondary text-secondary-foreground'}`}>{msg.text}</div>
          </div>
        ))}
      </CardContent>
      <div className="p-4 border-t">
          <div className="flex gap-2 w-full items-center">
              <Input placeholder={chatPlaceholder} value={chatInput} onChange={e => setChatInput(e.target.value)} disabled={!canUserSendMessage} onKeyDown={handleKeyDown} />
              <Button type="button" size="icon" disabled={!canUserSendMessage || !chatInput.trim()} onClick={handleSendMessage}><Send className="h-4 w-4"/></Button>
          </div>
      </div>
    </Card>
  );
}

function VideoCallHandler({ socket, currentUserSession }: { socket: Socket | null; currentUserSession: UserSessionData | null }) {
  type CallInfo = { adminSocketId: string; adminName: string };
  const [incomingCall, setIncomingCall] = useState<CallInfo | null>(null);
  const [isCallInProgress, setIsCallInProgress] = useState(false);
  const localStreamRef = useRef<MediaStream | null>(null);
  
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const adminSocketIdRef = useRef<string | null>(null);
  const { toast } = useToast();

  const cleanupCall = useCallback((notifyServer = false) => {
    if (notifyServer && socket && socket.connected && adminSocketIdRef.current) {
        socket.emit('webrtc:end-call', { targetSocketId: adminSocketIdRef.current });
    }
    if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
        localStreamRef.current = null;
    }

    if (peerConnectionRef.current) { peerConnectionRef.current.close(); peerConnectionRef.current = null; }
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    
    setIsCallInProgress(false);
    setIncomingCall(null);
    adminSocketIdRef.current = null;
  }, [socket]);

  const handleCallEnded = useCallback(() => {
    toast({ title: "Llamada Finalizada" });
    cleanupCall(false);
  }, [toast, cleanupCall]);

  useEffect(() => {
    if (!socket || !currentUserSession) return;
    
    const handleIncomingCall = (data: CallInfo) => { if (!isCallInProgress) setIncomingCall(data); };
    
    const handleOffer = async (data: { senderSocketId: string; offer: RTCSessionDescriptionInit }) => {
        if (!isCallInProgress || !peerConnectionRef.current) return;
        adminSocketIdRef.current = data.senderSocketId;
        const pc = peerConnectionRef.current;
        try {
            await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            socket.emit('private-sdp-answer', { targetSocketId: data.senderSocketId, answer });
        } catch (error) { console.error("UserVC: Error handling offer:", error); cleanupCall(true); }
    };
    
    const handleIceCandidate = (data: { candidate: RTCIceCandidateInit }) => {
      if (peerConnectionRef.current?.remoteDescription) {
        peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(data.candidate)).catch(e => console.error("UserVC: Error adding ICE candidate:", e));
      }
    };
    
    socket.on('server:private-call-invite', handleIncomingCall);
    socket.on('webrtc:call-ended-by-peer', handleCallEnded);
    socket.on('server:sdp-offer-received', handleOffer);
    socket.on('webrtc:ice-candidate-received', handleIceCandidate);

    return () => {
      socket.off('server:private-call-invite', handleIncomingCall);
      socket.off('webrtc:call-ended-by-peer', handleCallEnded);
      socket.off('server:sdp-offer-received', handleOffer);
      socket.off('webrtc:ice-candidate-received', handleIceCandidate);
    };
  }, [socket, toast, cleanupCall, currentUserSession, isCallInProgress, handleCallEnded]);
  
  useEffect(() => {
    if (isCallInProgress && localStreamRef.current && localVideoRef.current) {
        localVideoRef.current.srcObject = localStreamRef.current;
    }
  }, [isCallInProgress]);

  const handleAcceptCall = async () => {
    if (!incomingCall || !socket) return;
    adminSocketIdRef.current = incomingCall.adminSocketId;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = stream;
      
      const pc = new RTCPeerConnection(PC_CONFIG);
      stream.getTracks().forEach(track => pc.addTrack(track, stream));
      pc.ontrack = e => { 
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = e.streams[0]; 
      };
      pc.onicecandidate = e => { 
        if (e.candidate) socket.emit('webrtc:ice-candidate', { targetSocketId: incomingCall.adminSocketId, candidate: e.candidate }); 
      };
      pc.onconnectionstatechange = () => { 
        if (['disconnected', 'closed', 'failed'].includes(pc.connectionState || '')) cleanupCall(false); 
      };
      peerConnectionRef.current = pc;

      setIsCallInProgress(true); 
      setIncomingCall(null);
      socket.emit('user:accepts-private-call', { adminSocketId: incomingCall.adminSocketId });

      // ⬇️ Agregás esto: pequeño delay para que el Dialog se monte y el ref exista
      setTimeout(() => {
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      }, 500);  // 500ms es un tiempo seguro, incluso podés probar con menos, pero así es más robusto
    } catch (err) { 
      console.error("UserVC: Error getting media devices:", err); 
      toast({ title: 'Error de Cámara', description: 'No se pudo acceder a tus dispositivos.', variant: 'destructive'});
      cleanupCall();
    }
};

  
  return (
    <>
      <AlertDialog open={!!incomingCall}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Llamada Entrante</AlertDialogTitle>
            <AlertDialogDescription>Estás recibiendo una videollamada de <strong>{incomingCall?.adminName || 'Admin'}</strong>.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setIncomingCall(null);
              // Optionally notify admin that call was rejected
            }}>Rechazar</AlertDialogCancel>
            <AlertDialogAction onClick={handleAcceptCall}><Phone className="mr-2 h-4 w-4"/>Aceptar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <Dialog open={isCallInProgress} onOpenChange={(open) => { if (!open) cleanupCall(true); }}>
        <DialogContent className="max-w-4xl p-4 border-primary shadow-2xl bg-background">
          <DialogHeader>
            <DialogTitleComponent>Videollamada con el Administrador</DialogTitleComponent>
          </DialogHeader>
          <div className="relative mt-4 bg-black aspect-video rounded-lg overflow-hidden">
              <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
              <div className="absolute bottom-4 right-4 w-1/4 max-w-[200px] aspect-video border-2 border-primary rounded-md overflow-hidden shadow-lg z-10 bg-black">
                  <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
              </div>
          </div>
          <div className="flex justify-center mt-4">
              <Button onClick={() => cleanupCall(true)} variant="destructive">
                  <PhoneOff className="mr-2 h-4 w-4" /> Terminar Llamada
              </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function LivePage() {
  const [livestreamSettings, setLivestreamSettings] = useState<LivestreamSettings | null>(null);
  const [streamInfo, setStreamInfo] = useState<{title: string, subtitle: string} | null>(null);
  const [currentUserSession, setCurrentUserSession] = useState<UserSessionData | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [displayMode, setDisplayMode] = useState<'loading' | 'iframe' | 'webcam' | 'unauthorized' | 'disabled'>('loading');
  const { toast } = useToast();

  useEffect(() => {
    const session = localStorage.getItem(USER_SESSION_KEY) ? JSON.parse(localStorage.getItem(USER_SESSION_KEY)!) : null;
    setCurrentUserSession(session);
    
    const newSocket = io({ path: '/api/socket_io' });
    setSocket(newSocket);
    
    async function fetchSettings() {
      try {
        const settings = await getSetting<LivestreamSettings>('livestream');
        setLivestreamSettings(settings);
      } catch (error) {
        console.error("Failed to load settings:", error);
        setDisplayMode('disabled');
      }
    }
    fetchSettings();

    newSocket.on('connect', () => {
      const userId = session?.uid;
      const isAdmin = session?.role === 'admin';
      const displayName = session?.chatDisplayName || (session ? `${session.firstName || ''} ${session.lastName || ''}`.trim() || `User-${session.uid.substring(0,4)}` : 'Invitado');
      newSocket.emit('identify', { userId, isAdmin, displayName });
    });
    
    newSocket.on('CHAT_MESSAGE_REJECTED', (data: { reason: string }) => {
      toast({
        title: 'Mensaje no enviado',
        description: data.reason,
        variant: 'destructive',
      });
    });

    return () => {
      newSocket.emit('viewer:left-live-page');
      newSocket.off('CHAT_MESSAGE_REJECTED');
      newSocket.disconnect();
    };
  }, [toast]);

  useEffect(() => {
    if (livestreamSettings !== null) {
        const isUserLoggedInAndVerified = !!currentUserSession && currentUserSession.isVerified;
        const { visibility = 'disabled', streamType = 'iframe', exclusiveUserIds = [] } = livestreamSettings;

        let canViewStream = false;
        if (visibility === 'public') canViewStream = true;
        else if (visibility === 'private' && isUserLoggedInAndVerified) canViewStream = true;
        else if (visibility === 'exclusive' && isUserLoggedInAndVerified && currentUserSession?.uid) {
          canViewStream = exclusiveUserIds.includes(currentUserSession.uid);
        }
        
        if (visibility === 'disabled') {
            setDisplayMode('disabled');
        } else if (!canViewStream) {
            setDisplayMode('unauthorized');
        } else {
            setDisplayMode(streamType);
            if (socket && socket.connected) {
                socket.emit('viewer:im-on-live-page');
            }
        }
    }
  }, [livestreamSettings, currentUserSession, socket]);

  if (displayMode === 'loading') {
    return <div className="flex flex-col min-h-screen"><main className="flex-grow py-8 md:py-12 container mx-auto px-4"><div className="flex flex-col lg:flex-row gap-8"><div className="lg:w-2/3 space-y-6"><Skeleton className="aspect-video w-full rounded-lg" /><Card><CardHeader><Skeleton className="h-8 w-3/4 mb-2" /><Skeleton className="h-4 w-full" /></CardHeader><CardContent><Skeleton className="h-6 w-1/2" /></CardContent></Card></div><div className="lg:w-1/3"><Card className="h-[600px] flex flex-col"><CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader><CardContent className="flex-grow min-h-[300px]"><Skeleton className="h-full w-full" /></CardContent><CardFooter><Skeleton className="h-10 w-full" /></CardFooter></Card></div></div></main></div>;
  }
  if (displayMode === 'disabled') {
    return <div className="flex flex-col min-h-screen"><main className="flex-grow container mx-auto px-4 py-12 flex flex-col items-center justify-center text-center"><AlertTriangle className="h-16 w-16 text-destructive mb-4" /><h1 className="text-3xl font-bold text-destructive mb-2">Stream Deshabilitado</h1><Button asChild className="mt-6"><Link href="/">Página Principal</Link></Button></main></div>;
  }
  if (displayMode === 'unauthorized') {
    let message = !currentUserSession ? "Debes iniciar sesión." : "Acceso restringido.";
    return <div className="flex flex-col min-h-screen"><main className="flex-grow container mx-auto px-4 py-12 flex flex-col items-center justify-center text-center"><Lock className="h-16 w-16 text-primary mb-4" /><h1 className="text-3xl font-bold text-primary mb-2">Acceso Restringido</h1><p className="text-muted-foreground">{message}</p><Button asChild className="mt-6"><Link href={currentUserSession ? '/' : '/login'}>Ir a {currentUserSession ? 'Inicio' : 'Login'}</Link></Button></main></div>;
  }
  
  const streamTitle = streamInfo?.title || livestreamSettings?.streamTitle || "Live Event";
  const streamDescription = streamInfo?.subtitle || livestreamSettings?.streamDescription || "Join us!";
  const offlineMessage = livestreamSettings?.webcamOfflineMessage || 'El stream en vivo comenzará pronto!';

  const renderStream = () => {
    switch(displayMode) {
        case 'webcam':
            return <WebcamViewer socket={socket} onStreamInfo={setStreamInfo} offlineMessage={offlineMessage} />;
        case 'iframe':
            const streamUrl = livestreamSettings?.streamUrl || siteConfig.defaultLiveStreamUrl;
            return streamUrl ? <LiveStreamEmbed streamUrl={streamUrl} title={streamTitle} /> : null;
        default:
            return null;
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-2/3 space-y-6">
              {renderStream()}
              <Card className="shadow-lg"><CardHeader><CardTitle className="font-headline text-2xl text-primary">{streamTitle}</CardTitle><CardDescription>{streamDescription}</CardDescription></CardHeader></Card>
            </div>
            <div className="lg:w-1/3">
              {socket ? <LiveChatBox socket={socket} currentUserSession={currentUserSession} isChatGloballyEnabled={livestreamSettings?.isChatEnabled !== false} livestreamSettings={livestreamSettings} /> : <Skeleton className="h-[600px] w-full" /> }
            </div>
          </div>
        </div>
      </main>
      {socket && <VideoCallHandler socket={socket} currentUserSession={currentUserSession} />}
    </div>
  );
}
