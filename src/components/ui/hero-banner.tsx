import Image from 'next/image';

interface HeroBannerProps {
  mainText?: string;
  secondaryText?: string;
  descriptionText?: string;
  heroImageUrl?: string;
  mainTextColor?: string;
  heroSecondaryTextColor?: string;
  heroDescriptionTextColor?: string;
}

export function HeroBanner({
  mainText = "Welcome Headline",
  secondaryText = "Secondary Headline",
  descriptionText = "Description text for the hero banner.",
  heroImageUrl,
  mainTextColor = "#FFFFFF",
  heroSecondaryTextColor = "#EE82EE", // Matches default --accent HSL
  heroDescriptionTextColor = "#F5F5F5" // Matches default --foreground HSL
}: HeroBannerProps) {
  return (
    <div className="relative bg-gradient-to-br from-primary via-purple-600 to-pink-500 text-primary-foreground py-20 md:py-32 rounded-lg shadow-xl overflow-hidden mb-12">
      <div className="absolute inset-0">
        {heroImageUrl ? (
          <Image
            src={heroImageUrl}
            alt="Hero background"
            fill
            className="object-cover opacity-20"
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-purple-600/10 to-pink-500/10"></div>
        )}
        <div className="absolute inset-0 bg-black opacity-30"></div>
      </div>
      <div className="container mx-auto px-4 relative z-10 text-center">
        <h1
          className="font-headline text-4xl md:text-6xl font-bold mb-4 animate-fade-in-down"
          style={{ color: mainTextColor }}
        >
          {mainText}
        </h1>
        <h2 
          className="font-headline text-2xl md:text-3xl mb-6 animate-fade-in-up [animation-delay:0.3s]"
          style={{ color: heroSecondaryTextColor }}
        >
          {secondaryText}
        </h2>
        <p 
          className="text-lg md:text-xl max-w-2xl mx-auto mb-8 animate-fade-in-up [animation-delay:0.6s] font-body"
          style={{ color: heroDescriptionTextColor }}
        >
          {descriptionText}
        </p>
      </div>
    </div>
  );
}
