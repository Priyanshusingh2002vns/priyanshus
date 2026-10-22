import Footer from "./footer/Footer";
import PreqtAppSection from "./preqtAppsection/page";
import StepsComponent from "./stepsComponent/StepsComponent";


export default function LandingPage() {
    return (
        <div style={{background:'#111'}}>
            <StepsComponent/>
            <PreqtAppSection/>
            <Footer/>
        </div>
    )
}