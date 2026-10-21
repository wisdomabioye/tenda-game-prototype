export interface VenueAnchor {
    category: string;
    name: string;
    x: number;
    z: number;
    h: number;
}
export interface LandmarkAnchor {
    direction?: {
        x: number;
        z: number;
    };
    id: string;
    name: string;
    x: number;
    y: number;
    z: number;
}
