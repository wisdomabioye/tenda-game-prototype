import type { Mission } from "../../domains/missions/model/mission";
const starter: Omit<Mission, "country" | "city" | "latitude" | "longitude" | "cross_border">[] = [
    {
        escrow_id: "26519e0f-3ff0-47dc-8adf-9d762aa06168",
        destination: "workshop",
        district: "Digital workshop",
        color: "#95b8f2",
        title: "Try a mobile checkout",
        description: "Explore the provided demo checkout. Record the steps, then describe what worked and what could be clearer. Never use real payment details.",
        category: "digital",
        remote: true,
        amount_raw: "6000000",
        asset: "USDC",
        chain_id: "eip155:42220",
        proof_requirements: ["video", "text"],
        proof_params: null,
        requires_approval: false,
    },
    {
        escrow_id: "104782d7-914c-4ede-b33a-843568d9e7e7",
        destination: "observatory",
        district: "Creative lookout",
        color: "#d7b6ef",
        title: "Give a moodboard a fresh look",
        description: "Review the supplied moodboard and collect your feedback in a short document. The poster selects a worker from applications before work starts.",
        category: "photo",
        remote: true,
        amount_raw: "8000000",
        asset: "USDC",
        chain_id: "eip155:42220",
        proof_requirements: ["document"],
        proof_params: null,
        requires_approval: true,
    },
    {
        escrow_id: "b7390b85-a47e-4ffd-ad0c-813f87931f16",
        destination: "garden",
        district: "Service garden",
        color: "#b5dbad",
        title: "Check a help-centre article",
        description: "Read the provided demo article. Report its number of steps and whether the instructions were clear. This is a remote service task.",
        category: "service",
        remote: true,
        amount_raw: "4500000",
        asset: "USDC",
        chain_id: "eip155:42220",
        proof_requirements: ["structured"],
        proof_params: {
            structured: {
                fields: [
                    { name: "step_count", kind: "number", required: true },
                    { name: "instructions_clear", kind: "boolean", required: true },
                ],
            },
        },
        requires_approval: false,
    },
];
const fixtures: [
    string,
    string,
    Mission["category"],
    string
][] = [
    ["NG", "Lagos", "delivery", "Take a print order to the collection desk"],
    ["NG", "Lagos", "delivery", "Bring packaging supplies to a small studio"],
    ["NG", "Lagos", "delivery", "Deliver a sample box to a shop"],
    ["NG", "Lagos", "errand", "Collect a reserved stationery order"],
    ["NG", "Lagos", "errand", "Check availability at a neighbourhood shop"],
    ["NG", "Lagos", "photo", "Photograph a handmade product collection"],
    ["NG", "Lagos", "service", "Help label stock at a workshop"],
    ["NG", "Lagos", "service", "Set up chairs for a community session"],
    ["NG", "Lagos", "digital", "Check a tablet menu at a café"],
    ["NG", "Abuja", "delivery", "Deliver printed workshop booklets"],
    ["NG", "Abuja", "errand", "Collect a repaired desk lamp"],
    ["NG", "Abuja", "photo", "Take photos of a craft display"],
    ["NG", "Abuja", "service", "Organise a book donation shelf"],
    ["NG", "Abuja", "delivery", "Bring event badges to the venue"],
    ["KE", "Nairobi", "delivery", "Deliver a labelled textile sample"],
    ["KE", "Nairobi", "delivery", "Take a document pack to reception"],
    ["KE", "Nairobi", "photo", "Photograph a small café menu"],
    ["KE", "Nairobi", "service", "Prepare materials for a learning session"],
    ["KE", "Nairobi", "errand", "Check the listed price of stationery"],
    ["KE", "Nairobi", "digital", "Test a kiosk information screen"],
    ["KE", "Mombasa", "delivery", "Bring packaging to a craft shop"],
    ["KE", "Mombasa", "photo", "Capture a product display in daylight"],
    ["KE", "Mombasa", "service", "Arrange a reading corner"],
    ["KE", "Mombasa", "errand", "Collect reserved print samples"],
    ["GH", "Accra", "photo", "Photograph a textile swatch collection"],
    ["GH", "Accra", "photo", "Capture new products for a shop catalogue"],
    ["GH", "Accra", "errand", "Check opening hours at a collection desk"],
    ["GH", "Accra", "delivery", "Bring printed cards to a studio"],
    ["GH", "Accra", "service", "Label materials for a craft class"],
    ["GH", "Kumasi", "photo", "Document a small exhibition display"],
    ["GH", "Kumasi", "service", "Organise supplies at a shared workshop"],
    ["GH", "Kumasi", "errand", "Collect a reserved art-supply order"],
    ["ZA", "Cape Town", "photo", "Photograph a ceramics collection"],
    ["ZA", "Cape Town", "photo", "Capture a workshop space for its listing"],
    ["ZA", "Cape Town", "service", "Prepare a repair-clinic check-in desk"],
    ["ZA", "Cape Town", "delivery", "Deliver display cards to a shop"],
    ["ZA", "Cape Town", "digital", "Review an onsite booking kiosk"],
    ["ZA", "Johannesburg", "photo", "Take catalogue photos of notebooks"],
    ["ZA", "Johannesburg", "service", "Arrange a neighbourhood class space"],
    ["ZA", "Johannesburg", "delivery", "Bring labelled supplies to a studio"],
];
const extraRemote: [
    Mission["category"],
    string
][] = [
    ["digital", "Review the navigation of a sample website"],
    ["photo", "Edit a short product description layout"],
    ["digital", "Check a sign-up form for confusing labels"],
    ["service", "Review a help-centre checklist"],
    ["photo", "Give feedback on a poster composition"],
    ["digital", "Find broken links in a demo site"],
    ["digital", "Check readability of a mobile landing page"],
];
function makeMission(category: Mission["category"], title: string, index: number, country: string | null, city: string | null): Mission {
    const remote = country === null;
    const structured = category === "digital" && index % 3 === 0;
    const proof_requirements: Mission["proof_requirements"] = structured
        ? ["structured"]
        : category === "photo"
            ? ["image", "text"]
            : category === "digital"
                ? ["video", "text"]
                : ["image", "text"];
    const geotag = index === 11;
    if (geotag)
        proof_requirements.push("geotag");
    return {
        escrow_id: `sample-${String(index).padStart(3, "0")}`,
        destination: `mission-${index}`,
        district: category === "photo"
            ? "Creative studio"
            : category === "delivery"
                ? "Dispatch dock"
                : category === "errand"
                    ? "Market square"
                    : category === "digital"
                        ? "Digital workshop"
                        : "Service garden",
        color: "#1672D4",
        title,
        description: `${title}. ${remote ? "Use the supplied demo materials." : `This is an in-person sample task in ${city}. Confirm the actual address and task terms before accepting.`} Follow the poster’s brief and share the required evidence. All details in this preview are fictional.`,
        category,
        remote,
        country,
        city,
        latitude: geotag ? 6.5244 : null,
        longitude: geotag ? 3.3792 : null,
        cross_border: false,
        amount_raw: String((4 + (index % 13)) * 1000000),
        asset: "USDC",
        chain_id: "eip155:42220",
        proof_requirements,
        proof_params: structured
            ? {
                structured: {
                    fields: [
                        { name: "step_count", kind: "number", required: true },
                        { name: "instructions_clear", kind: "boolean", required: true },
                    ],
                },
            }
            : geotag
                ? { geotag: { radius_m: 500 } }
                : null,
        requires_approval: category === "photo" || index % 5 === 0,
    };
}
export const missions: Mission[] = [
    ...starter.map((m) => ({
        ...m,
        country: null,
        city: null,
        latitude: null,
        longitude: null,
        cross_border: false,
    })),
    ...extraRemote.map(([category, title], n) => makeMission(category, title, n + 3, null, null)),
    ...fixtures.map(([country, city, category, title], n) => makeMission(category, title, n + 10, country, city)),
];
export const byDestination = (id: string) => missions.find((m) => m.destination === id || m.escrow_id === id);
