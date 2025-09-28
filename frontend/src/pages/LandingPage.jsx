import Navbar from "./Navbar";
import HeroSection from "./HeroSection";
import Feature from "./Feature";
import Newsletter from "./Newsletter";
import Footer from "./Footer";
import InfoCard from "./InfoCard";
const LandingPage=()=>{
    return(
        <div>
            <Navbar/>
            <HeroSection/>
<InfoCard/>
            <Feature/>
            <Newsletter/>
            <Footer/>
        </div>
    )
}

export default LandingPage;