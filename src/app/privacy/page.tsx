'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyPolicyPage() {
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
            <CardTitle className="text-4xl md:text-5xl font-headline text-center text-primary">Privacy Policy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-base leading-relaxed">
            <p className="text-muted-foreground">Last Updated: {currentDate}</p>
            
            <section>
              <h2 className="text-2xl font-headline font-semibold mb-2 text-accent">1. Introduction</h2>
              <p>ONLYfansLY ("we", "our", "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services. Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the site.</p>
            </section>

            <section>
              <h2 className="text-2xl font-headline font-semibold mb-2 text-accent">2. Collection of Your Information</h2>
              <p>We may collect information about you in a variety of ways. The information we may collect on the Site includes:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><strong>Personal Data:</strong> Personally identifiable information, such as your name, shipping address, email address, and telephone number, and demographic information, such as your age, gender, hometown, and interests, that you voluntarily give to us when you register with the Site or when you choose to participate in various activities related to the Site, such as online chat and message boards.</li>
                <li><strong>Derivative Data:</strong> Information our servers automatically collect when you access the Site, such as your IP address, your browser type, your operating system, your access times, and the pages you have viewed directly before and after accessing the Site.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-headline font-semibold mb-2 text-accent">3. Use of Your Information</h2>
              <p>Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Site to:</p>
               <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Create and manage your account.</li>
                <li>Email you regarding your account or order.</li>
                <li>Enable user-to-user communications.</li>
                <li>Fulfill and manage purchases, orders, payments, and other transactions related to the Site.</li>
                <li>Generate a personal profile about you to make future visits to the Site more personalized.</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-2xl font-headline font-semibold mb-2 text-accent">4. Disclosure of Your Information</h2>
              <p>We may share information we have collected about you in certain situations. Your information may be disclosed as follows: By Law or to Protect Rights, Third-Party Service Providers, Business Transfers, etc.</p>
            </section>

            <section>
              <h2 className="text-2xl font-headline font-semibold mb-2 text-accent">5. Security of Your Information</h2>
              <p>We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.</p>
            </section>

            <section>
              <h2 className="text-2xl font-headline font-semibold mb-2 text-accent">6. Contact Us</h2>
              <p>If you have questions or comments about this Privacy Policy, please contact us at: privacy@onlyfansly.example.com</p>
            </section>
          </CardContent>
        </Card>
      </main>
      {/* <Footer /> Footer is in RootLayout */}
    </div>
  );
}
