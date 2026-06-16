import { Navbar } from '../../components/layout/navbar';
import { Footer } from '../../components/layout/footer';
import SocialFloatingButtons from '../../components/FloatingButton';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
      <SocialFloatingButtons
        whatsappNumber="+919845866505"
        instagramUsername="wildearthjunglecamp"
        whatsappMessage="Hi I'm interested in your stay."
      />
    </>
  );
}
