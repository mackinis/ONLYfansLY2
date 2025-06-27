
'use client';

import { useEffect, useState, useRef, useCallback, useTransition } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { getSetting, LivestreamSettings, StreamVisibility, StreamType, type ChatMode } from '@/services/settingsService';
import { saveLivestreamSettingsAction } from './actions';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { io, type Socket } from 'socket.io-client';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Video, VideoOff, Mic, MicOff, Loader2, Send, MessageSquare, PhoneCall, PhoneOff as PhoneOffIcon, Trash2, Users } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import type { UserProfile } from '@/services/userService';
import { getAllUsers } from '@/services/userService';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import Link from 'next/link';


const USER_SESSION_KEY = 'onlyfansly_user_session';
const DEFAULT_WEBCAM_OFFLINE_MESSAGE = 'El stream en vivo comenzará pronto!';

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

// Interfaces needed for the chat box
interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  text: string;
  timestamp: string;
  isAdmin: boolean;
}

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

// Reusable LiveChatBox component
function LiveChatBox({ socket, currentUserSession, isChatGloballyEnabled }: { socket: Socket | null; currentUserSession: UserSessionData | null; isChatGloballyEnabled: boolean;}) {
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
    if (!socket || !socket.connected || !chatInput.trim() || !currentUserSession?.uid) return;
    socket.emit('SEND_CHAT_MESSAGE', { message: chatInput.trim() });
    setChatInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
    }
  };
  
  const canUserSendMessage = socket && socket.connected && isChatGloballyEnabled && currentUserSession && currentUserSession.isVerified && (currentUserSession.canChat !== false || currentUserSession.role === 'admin');
  const chatPlaceholder = !socket || !socket.connected ? "Conectando al chat..." : !isChatGloballyEnabled ? "El chat está deshabilitado." : !currentUserSession ? "Inicia sesión para chatear." : !currentUserSession.isVerified ? "Verifica tu cuenta para chatear." : currentUserSession.canChat === false && currentUserSession.role !== 'admin' ? "Tu participación ha sido restringida." : "Escribe tu mensaje...";

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


export default function AdminLivestreamPage() {
  const [livestreamSettings, setLivestreamSettings] = useState<LivestreamSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, startTransition] = useTransition();
  const [isClearingChat, startClearChatTransition] = useTransition();
  const { toast } = useToast();

  // Form State
  const [streamType, setStreamType] = useState<StreamType>('webcam');
  const [streamUrl, setStreamUrl] = useState('');
  const [streamTitle, setStreamTitle] = useState('');
  const [streamDescription, setStreamDescription] = useState('');
  const [visibility, setVisibility] = useState<StreamVisibility>('disabled');
  const [exclusiveUserIdsString, setExclusiveUserIdsString] = useState('');
  const [isChatEnabled, setIsChatEnabled] = useState(true);
  const [chatMode, setChatMode] = useState<ChatMode>('loggedInOnly');
  const [adminChatDisplayName, setAdminChatDisplayName] = useState('');
  const [webcamOfflineMessage, setWebcamOfflineMessage] = useState(DEFAULT_WEBCAM_OFFLINE_MESSAGE);
  const [forbiddenKeywords, setForbiddenKeywords] = useState('');

  const [socket, setSocket] = useState<Socket | null>(null);
  const [currentUserSession, setCurrentUserSession] = useState<UserSessionData | null>(null);
  const mainVideoRef = useRef<HTMLVideoElement>(null);
  const pipVideoRef = useRef<HTMLVideoElement>(null);

  // Private Call State
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [designatedUserId, setDesignatedUserId] = useState<string>('');
  const [isUserConnected, setIsUserConnected] = useState(false);
  const [isPrivateCallActive, setIsPrivateCallActive] = useState(false);
  const [privateCallStatus, setPrivateCallStatus] = useState('');
  const localStreamForCallRef = useRef<MediaStream | null>(null);
  const privateCallPeerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const privateCallTargetSocketId = useRef<string | null>(null);

  // General Stream State
  const [isGeneralStreamActive, setIsGeneralStreamActive] = useState(false);
  const localStreamForGeneralRef = useRef<MediaStream | null>(null);
  const generalStreamPeerConnections = useRef<Map<string, RTCPeerConnection>>(new Map());

  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);

  const isPrivateCallActiveRef = useRef(isPrivateCallActive);
  useEffect(() => { isPrivateCallActiveRef.current = isPrivateCallActive; }, [isPrivateCallActive]);

  useEffect(() => {
    const storedSession = localStorage.getItem(USER_SESSION_KEY);
    if (storedSession) {
      try {
        const sessionData: UserSessionData = JSON.parse(storedSession);
        setCurrentUserSession(sessionData);
      } catch (e) {
        console.error("Error parsing admin session", e);
      }
    }
     const fetchUsers = async () => {
      setIsLoadingUsers(true);
      try {
        const fetchedUsers = await getAllUsers();
        setUsers(fetchedUsers.filter(u => u.role !== 'admin')); 
      } catch (error) {
        toast({ title: "Error", description: "No se pudieron cargar los usuarios.", variant: "destructive" });
      } finally {
        setIsLoadingUsers(false);
      }
    }
    fetchUsers();
  }, [toast]);
  
  const getCameraPermission = useCallback(async (): Promise<MediaStream | null> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setHasCameraPermission(true);
      return stream;
    } catch (error) {
      setHasCameraPermission(false);
      toast({ variant: 'destructive', title: 'Error de Cámara/Micrófono', description: 'No se pudo acceder a la cámara o al micrófono. Revisa los permisos.' });
      return null;
    }
  }, [toast]);

  const cleanupPrivateCallResources = useCallback(() => {
    if (privateCallPeerConnectionRef.current) {
        privateCallPeerConnectionRef.current.close();
        privateCallPeerConnectionRef.current = null;
    }
    if (localStreamForCallRef.current) {
        localStreamForCallRef.current.getTracks().forEach(track => track.stop());
        localStreamForCallRef.current = null;
    }
    if(mainVideoRef.current) mainVideoRef.current.srcObject = null;
    if(pipVideoRef.current) pipVideoRef.current.srcObject = null;
    privateCallTargetSocketId.current = null;
  }, []);

  const cleanupGeneralStreamResources = useCallback(() => {
    generalStreamPeerConnections.current.forEach(pc => pc.close());
    generalStreamPeerConnections.current.clear();
    if(localStreamForGeneralRef.current) {
        localStreamForGeneralRef.current.getTracks().forEach(track => track.stop());
        localStreamForGeneralRef.current = null;
    }
    if(mainVideoRef.current) mainVideoRef.current.srcObject = null;
  }, []);

  const handleEndPrivateCall = useCallback(() => {
    if (socket && privateCallTargetSocketId.current) {
      socket.emit('webrtc:end-call', { targetSocketId: privateCallTargetSocketId.current });
    }
    cleanupPrivateCallResources();
    setIsPrivateCallActive(false);
    setPrivateCallStatus('');
  }, [socket, cleanupPrivateCallResources]);

  const handleEndGeneralStream = useCallback(() => {
    if (socket) socket.emit('admin:end-general-stream');
    cleanupGeneralStreamResources();
    setIsGeneralStreamActive(false);
  }, [socket, cleanupGeneralStreamResources]);

  // Effect to initialize socket connection
  useEffect(() => {
    if (!currentUserSession?.uid) return;
    const newSocket = io({ path: '/api/socket_io' });
    setSocket(newSocket);
    return () => {
      newSocket.disconnect();
    };
  }, [currentUserSession]);
  
  // Effect to handle socket event listeners
  useEffect(() => {
    if (!socket) return;
    
    const onConnect = () => {
        const displayName = adminChatDisplayName || currentUserSession?.chatDisplayName || `${currentUserSession?.firstName} ${currentUserSession?.lastName}`.trim() || 'Admin';
        socket.emit('identify', { userId: currentUserSession?.uid, isAdmin: true, displayName });
        if(designatedUserId) {
            socket.emit('admin:check-user-status', { targetUserId: designatedUserId });
        }
    };

    const handleUserAcceptedCall = async (data: { userSocketId: string, userAppUserId: string }) => {
      if (data.userAppUserId !== designatedUserId || !localStreamForCallRef.current) return;
      privateCallTargetSocketId.current = data.userSocketId;
      setPrivateCallStatus(`Conectando con el usuario...`);
      const pc = new RTCPeerConnection(PC_CONFIG);
      privateCallPeerConnectionRef.current = pc;
      localStreamForCallRef.current.getTracks().forEach(track => pc.addTrack(track, localStreamForCallRef.current!));
      
      pc.ontrack = (event) => { if (mainVideoRef.current) mainVideoRef.current.srcObject = event.streams[0]; };
      pc.onicecandidate = (event) => { if (event.candidate) socket.emit('webrtc:ice-candidate', { targetSocketId: data.userSocketId, candidate: event.candidate }); };
      pc.onconnectionstatechange = () => {
        if (pc.connectionState === 'connected') setPrivateCallStatus(`Conectado`);
        if (['disconnected', 'failed', 'closed'].includes(pc.connectionState)) handleEndPrivateCall();
      };
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit('private-sdp-offer', { targetSocketId: data.userSocketId, offer });
    };

    const handlePrivateCallAnswer = (data: { answer: RTCSessionDescriptionInit }) => {
      if (privateCallPeerConnectionRef.current) {
        privateCallPeerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.answer));
      }
    };

    const handleNewViewerRequest = async (data: { viewerSocketId: string }) => {
        if (!localStreamForGeneralRef.current) return;
        const pc = new RTCPeerConnection(PC_CONFIG);
        generalStreamPeerConnections.current.set(data.viewerSocketId, pc);

        localStreamForGeneralRef.current.getTracks().forEach(track => pc.addTrack(track, localStreamForGeneralRef.current!));
        pc.onicecandidate = (event) => { if (event.candidate) socket.emit('webrtc:ice-candidate', { targetSocketId: data.viewerSocketId, candidate: event.candidate }); };
        pc.onconnectionstatechange = () => { if (['disconnected', 'closed', 'failed'].includes(pc.connectionState)) { generalStreamPeerConnections.current.delete(data.viewerSocketId); } };
        
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit('broadcaster:offer-to-viewer', { viewerSocketId: data.viewerSocketId, offer });
    };
    
    const handleAnswerFromViewer = (data: { viewerSocketId: string, answer: RTCSessionDescriptionInit }) => {
      const pc = generalStreamPeerConnections.current.get(data.viewerSocketId);
      if (pc) pc.setRemoteDescription(new RTCSessionDescription(data.answer));
    };

    const handleRemoteCandidate = (data: { senderSocketId: string, candidate: RTCIceCandidateInit }) => {
      const pc = generalStreamPeerConnections.current.get(data.senderSocketId) || (data.senderSocketId === privateCallTargetSocketId.current ? privateCallPeerConnectionRef.current : null);
      if (pc && pc.remoteDescription) {
        pc.addIceCandidate(new RTCIceCandidate(data.candidate)).catch(console.error);
      }
    };
    
    const handleCallEndedByPeer = () => { if (isPrivateCallActiveRef.current) handleEndPrivateCall(); };

    const handleUserStatusUpdate = (data: { userId: string, isConnected: boolean }) => {
        if (data.userId === designatedUserId) {
          setIsUserConnected(data.isConnected);
          if (!data.isConnected && isPrivateCallActiveRef.current) {
            toast({ title: 'Usuario Desconectado', description: 'La llamada ha finalizado.'});
            handleEndPrivateCall();
          }
        }
    };
    
    socket.on('connect', onConnect);
    socket.on('server:user-status-update', handleUserStatusUpdate);
    socket.on('server:user-accepted-call', handleUserAcceptedCall);
    socket.on('server:sdp-answer-received', handlePrivateCallAnswer);
    socket.on('server:new-viewer-request', handleNewViewerRequest);
    socket.on('server:answer-from-viewer', handleAnswerFromViewer);
    socket.on('webrtc:ice-candidate-received', handleRemoteCandidate);
    socket.on('webrtc:call-ended-by-peer', handleCallEndedByPeer);

    if (designatedUserId) {
        socket.emit('admin:check-user-status', { targetUserId: designatedUserId });
    }

    return () => {
      socket.off('connect', onConnect);
      socket.off('server:user-status-update', handleUserStatusUpdate);
      socket.off('server:user-accepted-call', handleUserAcceptedCall);
      socket.off('server:sdp-answer-received', handlePrivateCallAnswer);
      socket.off('server:new-viewer-request', handleNewViewerRequest);
      socket.off('server:answer-from-viewer', handleAnswerFromViewer);
      socket.off('webrtc:ice-candidate-received', handleRemoteCandidate);
      socket.off('webrtc:call-ended-by-peer', handleCallEndedByPeer);
    };
  }, [socket, currentUserSession, designatedUserId, adminChatDisplayName, handleEndPrivateCall, handleEndGeneralStream, toast]);

  useEffect(() => {
    async function fetchSettings() {
      setIsLoading(true);
      try {
        const settings = await getSetting<LivestreamSettings>('livestream');
        setLivestreamSettings(settings);
        if (settings) {
            setStreamType(settings.streamType || 'webcam');
            setStreamUrl(settings.streamUrl || '');
            setStreamTitle(settings.streamTitle || '');
            setStreamDescription(settings.streamDescription || '');
            setVisibility(settings.visibility || 'disabled');
            setExclusiveUserIdsString(settings.exclusiveUserIds?.join(', ') || '');
            setIsChatEnabled(settings.isChatEnabled === undefined ? true : settings.isChatEnabled);
            setChatMode(settings.chatMode || 'loggedInOnly');
            setAdminChatDisplayName(settings.adminChatDisplayName || '');
            setWebcamOfflineMessage(settings.webcamOfflineMessage || DEFAULT_WEBCAM_OFFLINE_MESSAGE);
            setForbiddenKeywords(settings.forbiddenKeywords || '');
        }
      } catch (error) {
        toast({ title: "Error", description: "Failed to load livestream settings.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    }
    fetchSettings();
  }, [toast]);
  
  useEffect(() => {
    if (isPrivateCallActive && localStreamForCallRef.current && pipVideoRef.current) {
        pipVideoRef.current.srcObject = localStreamForCallRef.current;
    }
  }, [isPrivateCallActive]);
  
  useEffect(() => {
    if (mainVideoRef.current) {
      if (isGeneralStreamActive && localStreamForGeneralRef.current) {
        mainVideoRef.current.srcObject = localStreamForGeneralRef.current;
      } else if (!isPrivateCallActive) {
        mainVideoRef.current.srcObject = null;
      }
    }
  }, [isGeneralStreamActive, isPrivateCallActive]);

  const handleStartPrivateCall = useCallback(async () => {
    if (!socket || !designatedUserId || !isUserConnected || isPrivateCallActive || isGeneralStreamActive) return;

    setPrivateCallStatus('Solicitando acceso a la cámara...');
    
    const stream = await getCameraPermission();
    if (!stream) {
      setPrivateCallStatus('');
      return;
    }
    
    localStreamForCallRef.current = stream;
    setIsPrivateCallActive(true); 
    setPrivateCallStatus(`Invitando al usuario...`);
    if(pipVideoRef.current) pipVideoRef.current.srcObject = stream;
    
    const adminName = adminChatDisplayName || currentUserSession?.firstName || 'Admin';
    socket.emit('admin:initiate-private-call-request', { targetUserId: designatedUserId, adminName });
  }, [socket, designatedUserId, isUserConnected, isPrivateCallActive, isGeneralStreamActive, getCameraPermission, currentUserSession, adminChatDisplayName]);


  const handleToggleGeneralStreaming = useCallback(async () => {
    if (isGeneralStreamActive) {
      handleEndGeneralStream();
    } else {
      if (isPrivateCallActive) return;
      const stream = await getCameraPermission();
      if (!stream) return;
      localStreamForGeneralRef.current = stream;
      setIsGeneralStreamActive(true);
      const streamInfo = {
        title: streamTitle || 'Live Stream',
        subtitle: streamDescription || 'Join us!',
        isLoggedInOnly: visibility !== 'public'
      };
      if (socket) socket.emit('admin:start-general-stream', streamInfo);
    }
  }, [isGeneralStreamActive, isPrivateCallActive, getCameraPermission, socket, handleEndGeneralStream, streamTitle, streamDescription, visibility]);


  const handleSaveSettings = () => {
    const settingsData: LivestreamSettings & { exclusiveUserIdsString?: string } = {
        streamType,
        streamUrl,
        streamTitle,
        streamDescription,
        visibility,
        exclusiveUserIdsString,
        isChatEnabled,
        chatMode,
        adminChatDisplayName,
        webcamOfflineMessage,
        forbiddenKeywords
    };
    startTransition(async () => {
      const result = await saveLivestreamSettingsAction(settingsData);
       if (result.success) {
        toast({ title: "¡Éxito!", description: result.message });
        const newSettings = {
            ...settingsData,
            exclusiveUserIds: exclusiveUserIdsString.split(',').map(id => id.trim()).filter(Boolean)
        };
        setLivestreamSettings(newSettings);
      } else {
        toast({ title: "Error", description: result.message, variant: "destructive" });
      }
    });
  };

  const handleClearChatHistory = () => {
    startClearChatTransition(() => {
      if (socket && socket.connected) {
        socket.emit('ADMIN_CLEAR_CHAT_HISTORY');
        toast({ title: "Historial del Chat Borrado", description: "La solicitud para borrar el historial del chat ha sido enviada." });
      } else {
        toast({ title: "Error", description: "No se puede borrar el chat. El socket no está conectado.", variant: "destructive" });
      }
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div><Skeleton className="h-8 w-3/4 mb-2" /><Skeleton className="h-4 w-1/2" /></div>
        <Card><CardHeader><Skeleton className="h-6 w-1/3 mb-1" /><Skeleton className="h-4 w-2/3" /></CardHeader><CardContent><Skeleton className="h-40 w-full" /></CardContent></Card>
      </div>
    );
  }

  const isCallInProgress = isPrivateCallActive || isGeneralStreamActive;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-headline font-bold text-primary">Livestream</h1>
        <p className="text-muted-foreground">Gestiona tus transmisiones en vivo y llamadas privadas desde aquí.</p>
      </div>
      
      <Card>
          <CardHeader>
              <CardTitle>Configuración del Stream</CardTitle>
              <CardDescription>Elige el tipo de stream, configura sus detalles y visibilidad.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
              <div className="space-y-2">
                  <Label>Tipo de Stream</Label>
                  <RadioGroup value={streamType} onValueChange={(value) => setStreamType(value as StreamType)} className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                          <RadioGroupItem value="webcam" id="type-webcam" />
                          <Label htmlFor="type-webcam">Webcam</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                          <RadioGroupItem value="iframe" id="type-iframe" />
                          <Label htmlFor="type-iframe">Iframe / URL Externa</Label>
                      </div>
                  </RadioGroup>
              </div>

              {streamType === 'iframe' && (
                  <div className="space-y-2">
                      <Label htmlFor="streamUrl">URL del Stream (o código Iframe)</Label>
                      <Input id="streamUrl" value={streamUrl} onChange={(e) => setStreamUrl(e.target.value)} placeholder="https://youtube.com/embed/... o <iframe...>" />
                  </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="streamTitle">Título del Stream</Label>
                    <Input id="streamTitle" value={streamTitle} onChange={(e) => setStreamTitle(e.target.value)} placeholder="Mi Evento en Vivo" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="adminChatDisplayName">Tu Nombre en el Chat</Label>
                    <Input id="adminChatDisplayName" value={adminChatDisplayName} onChange={(e) => setAdminChatDisplayName(e.target.value)} placeholder="Admin" />
                </div>
              </div>

               <div className="space-y-2">
                  <Label htmlFor="streamDescription">Descripción del Stream</Label>
                  <Textarea id="streamDescription" value={streamDescription} onChange={(e) => setStreamDescription(e.target.value)} placeholder="Únete a nuestra transmisión especial..." />
              </div>
              
              <div className="space-y-2">
                    <Label htmlFor="webcamOfflineMessage">Mensaje Offline (para Webcam)</Label>
                    <Input id="webcamOfflineMessage" value={webcamOfflineMessage} onChange={(e) => setWebcamOfflineMessage(e.target.value)} placeholder={DEFAULT_WEBCAM_OFFLINE_MESSAGE} />
              </div>

              <div className="space-y-2">
                  <Label>Visibilidad del Stream</Label>
                  <RadioGroup value={visibility} onValueChange={(value) => setVisibility(value as StreamVisibility)} className="flex flex-wrap items-center gap-4">
                      <div className="flex items-center space-x-2"><RadioGroupItem value="disabled" id="vis-disabled" /><Label htmlFor="vis-disabled">Deshabilitado</Label></div>
                      <div className="flex items-center space-x-2"><RadioGroupItem value="public" id="vis-public" /><Label htmlFor="vis-public">Público</Label></div>
                      <div className="flex items-center space-x-2"><RadioGroupItem value="private" id="vis-private" /><Label htmlFor="vis-private">Solo Usuarios Registrados</Label></div>
                      <div className="flex items-center space-x-2"><RadioGroupItem value="exclusive" id="vis-exclusive" /><Label htmlFor="vis-exclusive">Usuarios Exclusivos</Label></div>
                  </RadioGroup>
              </div>

              {visibility === 'exclusive' && (
                  <div className="space-y-2">
                      <Label htmlFor="exclusiveUserIds">IDs de Usuarios Exclusivos (separados por coma)</Label>
                      <Textarea id="exclusiveUserIds" value={exclusiveUserIdsString} onChange={(e) => setExclusiveUserIdsString(e.target.value)} placeholder="IDUsuario1, IDUsuario2, ..." />
                  </div>
              )}
          </CardContent>
          <CardFooter>
            <Button onClick={handleSaveSettings} disabled={isSaving}>{isSaving ? 'Guardando...' : 'Guardar Configuración'}</Button>
          </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Configuración y Moderación del Chat</CardTitle>
          <CardDescription>Gestiona el comportamiento del chat en vivo y las reglas de moderación.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="flex items-center space-x-2 pt-2">
                <Switch id="isChatEnabled" checked={isChatEnabled} onCheckedChange={setIsChatEnabled} />
                <Label htmlFor="isChatEnabled">Habilitar Chat en Vivo Globalmente</Label>
            </div>
            <div className="space-y-2">
                <Label>Permisos de Chat</Label>
                <RadioGroup value={chatMode} onValueChange={(value) => setChatMode(value as ChatMode)} className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="loggedInOnly" id="chat-loggedin" />
                        <Label htmlFor="chat-loggedin">Solo usuarios registrados</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="public" id="chat-public" />
                        <Label htmlFor="chat-public">Cualquiera puede chatear</Label>
                    </div>
                </RadioGroup>
                <p className="text-xs text-muted-foreground">Controla si los invitados pueden participar en el chat o si se requiere iniciar sesión.</p>
            </div>
            <div className="space-y-2">
                <Label htmlFor="forbiddenKeywords">Palabras Clave Prohibidas (separadas por coma)</Label>
                <Textarea id="forbiddenKeywords" value={forbiddenKeywords} onChange={(e) => setForbiddenKeywords(e.target.value)} placeholder="Ej: palabra1, otra palabra, etc..." />
                <p className="text-xs text-muted-foreground">Los mensajes que contengan estas palabras serán bloqueados.</p>
            </div>
            <div>
                 <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" disabled={isClearingChat}>
                            {isClearingChat && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            <Trash2 className="mr-2 h-4 w-4" /> Limpiar Historial del Chat
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. Esto borrará permanentemente todo el historial del chat para todos los usuarios.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel disabled={isClearingChat}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleClearChatHistory} disabled={isClearingChat} className="bg-destructive hover:bg-destructive/90">
                            {isClearingChat ? 'Borrando...' : 'Sí, borrar historial'}
                        </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
             <div className="space-y-2 pt-4 border-t">
                <Label>Baneo de Usuarios</Label>
                <p className="text-sm text-muted-foreground">
                    Para restringir la participación de un usuario específico en el chat, ve a la página de <Button variant="link" asChild className="p-0 h-auto"><Link href="/admin/users">Gestión de Usuarios</Link></Button> y desactiva su permiso de "Permitir Chat".
                </p>
             </div>
        </CardContent>
         <CardFooter>
            <Button onClick={handleSaveSettings} disabled={isSaving}>{isSaving ? 'Guardando...' : 'Guardar Configuración del Chat'}</Button>
        </CardFooter>
      </Card>

       {streamType === 'webcam' && (
         <div className="grid lg:grid-cols-3 gap-6">
           <div className="lg:col-span-2 space-y-6">
             <Card>
              <CardHeader><CardTitle>Control de Video</CardTitle></CardHeader>
               <CardContent>
                  <div className="relative bg-black p-2 rounded-lg border">
                      <video ref={mainVideoRef} className="w-full aspect-video rounded-md bg-black" autoPlay playsInline muted={isGeneralStreamActive} />
                       {isPrivateCallActive && (
                          <div className="absolute bottom-4 right-4 w-1/4 max-w-[200px] aspect-video border-2 border-primary rounded-md overflow-hidden shadow-lg z-10 bg-black">
                              <video ref={pipVideoRef} className="w-full h-full object-cover" autoPlay playsInline muted />
                          </div>
                      )}
                      {!isCallInProgress && (
                          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70">
                              <VideoOff className="h-16 w-16 text-muted-foreground" />
                              <p className="mt-4 text-lg text-muted-foreground">{webcamOfflineMessage}</p>
                          </div>
                      )}
                  </div>
               </CardContent>
             </Card>
             
             <Card>
              <CardHeader><CardTitle>Controles de Transmisión (Webcam)</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Transmisión General</Label>
                  <div className="flex gap-2">
                    <Button onClick={handleToggleGeneralStreaming} disabled={isPrivateCallActive}>
                      {isGeneralStreamActive ? <VideoOff className="mr-2 h-4 w-4" /> : <Video className="mr-2 h-4 w-4" />}
                      {isGeneralStreamActive ? "Detener Stream" : "Iniciar Stream General"}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Videollamada Privada</Label>
                  {isLoadingUsers ? <Loader2 className="animate-spin" /> : (
                    <Select value={designatedUserId} onValueChange={setDesignatedUserId} disabled={isCallInProgress}>
                      <SelectTrigger><SelectValue placeholder="Seleccionar usuario para llamar..." /></SelectTrigger>
                      <SelectContent>
                        {users.map(user => <SelectItem key={user.uid} value={user.uid}>{user.firstName} {user.lastName} ({user.email})</SelectItem>)}
                      </SelectContent>
                    </Select>
                  )}
                   <div className="flex gap-2 mt-2">
                    <Button onClick={isPrivateCallActive ? handleEndPrivateCall : handleStartPrivateCall} disabled={!designatedUserId || isGeneralStreamActive || !isUserConnected}>
                      {isPrivateCallActive ? <PhoneOffIcon className="mr-2 h-4 w-4" /> : <PhoneCall className="mr-2 h-4 w-4" />}
                      {isPrivateCallActive ? "Terminar Llamada" : "Iniciar Llamada Privada"}
                    </Button>
                  </div>
                  <p className={cn("text-sm", isUserConnected ? "text-green-500" : "text-destructive")}>{designatedUserId ? (isUserConnected ? 'Usuario Conectado' : 'Usuario Desconectado') : 'Seleccione un usuario'}</p>
                  {privateCallStatus && <p className="text-sm text-muted-foreground">Estado: {privateCallStatus}</p>}
                </div>
              </CardContent>
             </Card>

           </div>
           <div className="lg:col-span-1">
            {isChatEnabled && socket ? (
              <LiveChatBox 
                socket={socket} 
                currentUserSession={currentUserSession} 
                isChatGloballyEnabled={isChatEnabled} 
              />
            ) : (
               <Card className="h-[600px] flex flex-col items-center justify-center">
                  <CardHeader>
                      <CardTitle className="font-headline text-xl flex items-center gap-2 text-accent">
                          <MessageSquare className="h-5 w-5" /> Chat Deshabilitado
                      </CardTitle>
                  </CardHeader>
                  <CardContent><p className="text-muted-foreground">Habilita el chat en la configuración.</p></CardContent>
               </Card>
            )}
           </div>
         </div>
       )}
    </div>
  );
}
