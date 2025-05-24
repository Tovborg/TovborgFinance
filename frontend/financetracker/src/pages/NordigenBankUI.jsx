import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

export default function SelectBank() {
    const { user, isLoading } = useAuth();
    if (isLoading) {
        return <div className="flex items-center justify-center min-h-screen text-white bg-gray-900">Loading...</div>
    }
    if (!user) {
        return <Navigate to="/" />
    }
    const [banks, setBanks] = useState([]);

    // Get list of banks from our backend
    useEffect(() => {
        const fetchBanks = async () => {
            try {
                const response = await fetch("http://127.0.0.1:8000/get_banks");
                const data = await response.json();
                setBanks(data.banks);
            } catch (error) {
                console.error("Error fetching banks:", error);
            }
        };
        fetchBanks();
    }, []);
    useEffect(() => {
        if (banks.length === 0) return;
        // Dynamisk load CSS
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/nordigen-bank-ui@1.5.2/package/src/selector.min.css";
        document.head.appendChild(link);

        const config = {
            redirectUrl: 'http://localhost:5173/dashboard',
            text: "Vælg din bank og få et komplet økonomisk overblik",
            logoUrl: 'https://cdn-logos.gocardless.com/ais/Nordigen_Logo_Black.svg',
            countryFilter: false,
        };

        // Load JS + kør selector
        const loadSelector = () => {
            if (window.institutionSelector) {
                window.institutionSelector(banks, 'institution-content-wrapper', config);
                setTimeout(() => {
                    const institutionList = Array.from(document.querySelectorAll('.ob-list-institution > a'));
                    institutionList.forEach((institution) => {
                        institution.addEventListener('click', (e) => {
                            e.preventDefault();
                            const institutionId = institution.getAttribute('data-institution');
                            // window.location.href = `/bank-connect/${institutionId}`; 
                            // Use sandbox connection for testing
                            window.location.href = `/bank-connect/SANDBOXFINANCE_SFIN0000`;
                        });
                    });
                }, 200);
            } else {
                setTimeout(loadSelector, 100);
            }
        };

        const script = document.createElement("script");
        script.src = "https://unpkg.com/nordigen-bank-ui@1.5.2/package/src/selector.min.js";
        script.onload = loadSelector;
        document.body.appendChild(script);

        // Cleanup script + stylesheet on unmount
        return () => {
            document.head.removeChild(link);
            document.body.removeChild(script);
        }
    }, [banks]);

    return <div id="institution-content-wrapper"></div>;
}
