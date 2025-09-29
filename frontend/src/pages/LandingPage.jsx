import Navbar from "./Navbar";
import HeroSection from "./HeroSection";
import Feature from "./Feature";
import Newsletter from "./Newsletter";
import Footer from "./Footer";
import InfoCard from "./InfoCard";

const LandingPage = () => {
    return(
        <div>
            <Navbar/>
            <HeroSection id="home"/>
            <InfoCard id="about"/>
            <Feature id="features"/>
            <Newsletter id="contact"/>
            <Footer/>
        </div>
    )
}

export default LandingPage;