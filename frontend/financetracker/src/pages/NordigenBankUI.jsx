import { useEffect } from "react"

export default function SelectBank() {
    useEffect(() => {
        // Dynamisk load CSS
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/nordigen-bank-ui@1.5.2/package/src/selector.min.css";
        document.head.appendChild(link);

        // Bankliste (normalt fra din backend)
        const exampleList = [
            {
                id: "ABNAMRO_ABNAGB2LXXX",
                name: "ABN AMRO Bank Commercial",
                logo: "https://cdn-logos.gocardless.com/ais/ABNAMRO_FTSBDEFAXXX.png",
                countries: ["GB"],
            },
            {
                id: "BBVAUK_BBVAGB2L",
                name: "BBVA",
                logo: "https://cdn-logos.gocardless.com/ais/BBVABE_BBVABEBB.png",
                countries: ["GB"],
            },
        ];

        const config = {
            redirectUrl: 'http://localhost:5173/dashboard',
            text: "Vælg din bank og få et komplet økonomisk overblik",
            logoUrl: 'https://cdn-logos.gocardless.com/ais/Nordigen_Logo_Black.svg',
            countryFilter: false,
        };

        // Load JS + kør selector
        const loadSelector = () => {
            if (window.institutionSelector) {
                window.institutionSelector(exampleList, 'institution-content-wrapper', config);
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
    }, []);

    return <div id="institution-content-wrapper"></div>;
}
