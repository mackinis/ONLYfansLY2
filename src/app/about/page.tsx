
import { Header } from "@/components/layout/header";
// Footer is now in RootLayout
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* <Header /> Header is in RootLayout */}
      <main className="flex-grow container mx-auto px-4 py-12 md:py-20">
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-4xl md:text-5xl font-headline text-center text-primary">About ONLYfansLY</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8 text-lg">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="md:w-1/2">
                 <Image 
                    src="https://placehold.co/800x600.png" 
                    alt="ONLYfansLY Team" 
                    width={800} 
                    height={600} 
                    className="rounded-lg shadow-md"
                    data-ai-hint="team collaboration"
                  />
              </div>
              <div className="md:w-1/2 space-y-4">
                <p className="font-semibold text-xl">Our Mission</p>
                <p>
                  At ONLYfansLY, our mission is to provide a dynamic and engaging platform for learning and live interaction. We believe in the power of shared knowledge and experiences to connect and inspire people globally.
                </p>
                <p>
                  We strive to offer high-quality courses, seamless live streaming, and interactive tools that cater to a diverse audience, fostering a community of learners, creators, and enthusiasts.
                </p>
              </div>
            </div>
            
            <div className="space-y-4">
              <h2 className="text-2xl font-headline font-semibold text-accent">Our Vision</h2>
              <p>
                To be the leading online destination where creativity meets education, and where every individual has the opportunity to learn, share, and grow. We envision a verse where live events and on-demand courses coexist to create a rich, interactive experience.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-headline font-semibold text-accent">Our Values</h2>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><span className="font-semibold">Innovation:</span> Continuously evolving our platform with the latest technology.</li>
                <li><span className="font-semibold">Community:</span> Fostering a supportive and interactive environment.</li>
                <li><span className="font-semibold">Quality:</span> Delivering excellence in content and user experience.</li>
                <li><span className="font-semibold">Accessibility:</span> Making learning and live events available to everyone, everywhere.</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </main>
      {/* <Footer /> Footer is in RootLayout */}
    </div>
  );
}
