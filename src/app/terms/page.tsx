'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TermsOfServicePage() {
  const [currentDate, setCurrentDate] = useState<string | null>(null);

  useEffect(() => {
    // This code runs only on the client, after the component has mounted.
    setCurrentDate(new Date().toLocaleDateString());
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {/* <Header /> Header is in RootLayout */}
      <main className="flex-grow container mx-auto px-4 py-12 md:py-20">
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-4xl md:text-5xl font-headline text-center text-primary">Terms of Service</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-base leading-relaxed">
            <p className="text-muted-foreground">Last Updated: {currentDate}</p>
            
            <section>
              <h2 className="text-2xl font-headline font-semibold mb-2 text-accent">1. Agreement to Terms</h2>
              <p>By accessing or using ONLYfansLY ("the Service"), you agree to be bound by these Terms of Service ("Terms"). If you disagree with any part of the terms, then you may not access the Service. These Terms apply to all visitors, users, and others who access or use the Service.</p>
            </section>

            <section>
              <h2 className="text-2xl font-headline font-semibold mb-2 text-accent">2. Accounts</h2>
              <p>When you create an account with us, you must provide information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service. You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password.</p>
            </section>

            <section>
              <h2 className="text-2xl font-headline font-semibold mb-2 text-accent">3. Content</h2>
              <p>Our Service allows you to post, link, store, share and otherwise make available certain information, text, graphics, videos, or other material ("Content"). You are responsible for the Content that you post to the Service, including its legality, reliability, and appropriateness. By posting Content to the Service, you grant us the right and license to use, modify, publicly perform, publicly display, reproduce, and distribute such Content on and through the Service.</p>
            </section>
            
            <section>
              <h2 className="text-2xl font-headline font-semibold mb-2 text-accent">4. Intellectual Property</h2>
              <p>The Service and its original content (excluding Content provided by users), features and functionality are and will remain the exclusive property of ONLYfansLY and its licensors. The Service is protected by copyright, trademark, and other laws of both the [Your Country] and foreign countries.</p>
            </section>

            <section>
              <h2 className="text-2xl font-headline font-semibold mb-2 text-accent">5. Termination</h2>
              <p>We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms. Upon termination, your right to use the Service will immediately cease.</p>
            </section>
            
            <section>
              <h2 className="text-2xl font-headline font-semibold mb-2 text-accent">6. Governing Law</h2>
              <p>These Terms shall be governed and construed in accordance with the laws of [Your Jurisdiction], without regard to its conflict of law provisions.</p>
            </section>

            <section>
              <h2 className="text-2xl font-headline font-semibold mb-2 text-accent">7. Changes to Terms</h2>
              <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material we will try to provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.</p>
            </section>

            <section>
              <h2 className="text-2xl font-headline font-semibold mb-2 text-accent">8. Contact Us</h2>
              <p>If you have any questions about these Terms, please contact us at: legal@onlyfansly.example.com</p>
            </section>
          </CardContent>
        </Card>
      </main>
      {/* <Footer /> Footer is in RootLayout */}
    </div>
  );
}
