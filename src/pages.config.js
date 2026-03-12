/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import Calculator from './pages/Calculator';
import Home from './pages/Home';
import Portfolio from './pages/Portfolio';
import About from './pages/About';
import Methodology from './pages/Methodology';
import Assumptions from './pages/Assumptions';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfUse from './pages/TermsOfUse';
import Disclaimer from './pages/Disclaimer';
import Contact from './pages/Contact';
import CookiePolicy from './pages/CookiePolicy';
import SecurityPolicy from './pages/SecurityPolicy';
import HelpCenter from './pages/HelpCenter';
import CommunityForum from './pages/CommunityForum';
import Login from './pages/Login';
import FamilyBudget from './pages/FamilyBudget';
import SuburbAnalyzer from './pages/SuburbAnalyzer';
import AuthCallback from './pages/AuthCallback';
import __Layout from './Layout.jsx';

export const PAGES = {
    "Calculator": Calculator,
    "Home": Home,
    "Portfolio": Portfolio,
    "About": About,
    "Methodology": Methodology,
    "Assumptions": Assumptions,
    "PrivacyPolicy": PrivacyPolicy,
    "TermsOfUse": TermsOfUse,
    "Disclaimer": Disclaimer,
    "Contact": Contact,
    "CookiePolicy": CookiePolicy,
    "SecurityPolicy": SecurityPolicy,
    "HelpCenter": HelpCenter,
    "CommunityForum": CommunityForum,
    "Login": Login,
    "FamilyBudget": FamilyBudget,
    "SuburbAnalyzer": SuburbAnalyzer,
    "AuthCallback": AuthCallback,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};