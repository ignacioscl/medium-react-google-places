import React, { useEffect, useRef,useState } from "react";
const useGooglePlaceAutoComplete = (key) => {
    const [scriptLoaded, setScriptLoaded] = useState(false);

    const scriptRef = useRef(null);

    useEffect(() => {
        if (!scriptLoaded) {
        // Cargar el script solo si no se ha cargado previamente
        const script = document.createElement("script");
        script.src =
            "https://maps.googleapis.com/maps/api/js?key=" + key + "&libraries=places";
        script.async = true;

        script.onload = () => {
            setScriptLoaded(true);
        };

        scriptRef.current = script;
        document.body.appendChild(script);
        }

        return () => {
        // Eliminar el script cuando el componente se desmonte
        if (scriptRef.current) {
            document.body.removeChild(scriptRef.current);
            scriptRef.current = null;
        }
        };
    }, [scriptLoaded]);

    const initAutoComplete = async (input, callback) => {
        let autoComplete =null;
        if (scriptLoaded) {
            autoComplete = new window.google.maps.places.Autocomplete(input,
                {
                    // limit to North America for now
                    componentRestrictions: { country: ["us", "ca"] },
                    fields: ["address_component", "geometry"],
                    types: ["address"]
                }
            );
            autoComplete.addListener("place_changed", callback);
        }
        return autoComplete;

    };

    const getFullAddress = async (autoComplete) => {

        const place = autoComplete.getPlace();
        
        let address1, 
            locality, 
            adminArea1Short, 
            adminArea1Long, 
            countryShort,
            countryLong, 
            postalCode = "";

        // Get each component of the address from the place details,
        for (const component of place.address_components) {
            
            const componentType = component.types[0];

            if (componentType === "street_number") {
                address1 = component.long_name;
            }
            if (componentType === "route") {
                address1 = `${address1} ${component.long_name}`;
            }
            if (componentType === "locality") {
                locality = component.long_name;
            }
            if (componentType === "administrative_area_level_1") {
                adminArea1Short = component.short_name;
                adminArea1Long = component.long_name;
            }
            if (componentType === "postal_code") {
                postalCode = component.long_name;
            }
            if (componentType === "postal_code_suffix") {
                postalCode = `${postalCode}-${component.long_name}`;
            }
            if (componentType === "country") {
                countryShort = component.short_name;
                countryLong = component.long_name;
            }
        }

        let resAddress = {
            "address1": address1,
            "locality": locality,
            "adminArea1Short": adminArea1Short,
            "adminArea1Long": adminArea1Long,
            "postalCode": postalCode,
            "countryShort": countryShort,
            "countryLong": countryLong
        };

        return resAddress;

    };

    return {
        initAutoComplete,
        getFullAddress,
        scriptLoaded
    };

};

export default useGooglePlaceAutoComplete;