export function MapCredit({ information }: {
    information: {
        name: string;
        attribution: string;
        licenceUrl: string;
        worldUnitsPerMetre: number;
    };
}) { return <div className="map-credit"><a href={information.licenceUrl} target="_blank" rel="noreferrer">{information.attribution}</a></div>; }
