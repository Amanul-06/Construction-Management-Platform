import PublicNavbar from "../../../components/public/PublicNavbar/PublicNavbar";
import PublicHero from "../../../components/public/PublicHero/PublicHero";
import PublicAbout from "../../../components/public/PublicAbout/PublicAbout";
import PublicServices from "../../../components/public/PublicServices/PublicServices";
import PublicProjects from "../../../components/public/PublicProjects/PublicProjects";
import PublicTestimonials from "../../../components/public/PublicTestimonials/PublicTestimonials";
import PublicStrengths from "../../../components/public/PublicStrengths/PublicStrengths";
import PublicWhyChooseUs from "../../../components/public/PublicWhyChooseUs/PublicWhyChooseUs";
import PublicContact from "../../../components/public/PublicContact/PublicContact";
import PublicFooter from "../../../components/public/PublicFooter/PublicFooter";
import WhatsAppChat from "../../../components/public/WhatsAppChat/WhatsAppChat";
import "./Home.css";

function Home() {
  return (
    <>
      <PublicNavbar />
      <main>
        <PublicHero />
        <PublicAbout />
        <PublicServices />
        <PublicProjects />
        <PublicStrengths />
        <PublicWhyChooseUs />
        <PublicTestimonials />
        <PublicContact />
      </main>
        <WhatsAppChat />
      <PublicFooter />
    </>
  );
}

export default Home;
