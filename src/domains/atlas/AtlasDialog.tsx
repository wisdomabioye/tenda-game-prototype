import {GameButton,GameCard} from '../../shared/ui/game/GameUI';
import { places } from "./places";
import geography from "./africa.json";
export function AtlasDialog({ country, setCountry, travel, onClose, }: {
    country: string | null;
    setCountry: (country: string | null) => void;
    travel: (id: string) => void;
    onClose: () => void;
}) {
    const countries = [
        ["NG", "Nigeria"],
        ["GH", "Ghana"],
        ["KE", "Kenya"],
        ["ZA", "South Africa"],
    ];
    const selected = geography.find((g) => g.id === country);
    const numbers = selected?.path.match(/-?\d+(?:\.\d+)?/g)?.map(Number) ?? [];
    const xs = numbers.filter((_, i) => i % 2 === 0), ys = numbers.filter((_, i) => i % 2 === 1);
    const bounds = country && xs.length
        ? `${Math.min(...xs) - 8} ${Math.min(...ys) - 8} ${Math.max(...xs) - Math.min(...xs) + 16} ${Math.max(...ys) - Math.min(...ys) + 16}`
        : "0 0 590 610";
    return (<div className="shade">
      <GameCard className="chart" role="dialog" aria-modal="true" aria-label="Geographic explorer">
        <div className="modal-head">
          <GameButton onClick={() => (country ? setCountry(null) : onClose())}>
            ← {country ? "Africa" : "Back to streets"}
          </GameButton>
          <GameButton aria-label="Close map" onClick={() => onClose()}>
            ×
          </GameButton>
        </div>
        <h1>
          {country
            ? countries.find((c) => c[0] === country)?.[1]
            : "Choose your next horizon"}
        </h1>
        <p>
          {country
            ? "Choose a city marker to enter its illustrative street district."
            : "Africa → country → city → street. Select a highlighted country."}
        </p>
        <svg viewBox={bounds} aria-label={country
            ? "City positions within selected country"
            : "Africa country outlines"}>
          {geography
            .filter((g) => !country || g.id === country)
            .map((g) => (<path key={g.name} d={g.path} fill={countries.some((c) => c[0] === g.id) ? "#ffd447" : "#e7d8b3"} stroke="#fff9ed" strokeWidth={country ? 0.4 : 1} onClick={() => countries.some((c) => c[0] === g.id) && setCountry(g.id)} style={{
                cursor: countries.some((c) => c[0] === g.id)
                    ? "pointer"
                    : "default",
            }}/>))}
          {country
            ? places
                .filter((p) => p.country === country)
                .map((p) => {
                const x = 55 + (p.lon + 20) * 6.3, y = 35 + (38 - p.lat) * 7;
                return (<g key={p.id} onClick={() => travel(p.id)} style={{ cursor: "pointer" }}>
                      <circle cx={x} cy={y} r={country === "GH" ? 1.6 : 2.8} fill="#1672d4" stroke="#fff9ed" strokeWidth=".6"/>
                      <text x={x + 3} y={y - 3} fontSize={country === "GH" ? 3.5 : 5} fill="#183244">
                        {p.name}
                      </text>
                    </g>);
            })
            : countries.map(([id, name]) => {
                const p = places.find((p) => p.country === id)!;
                return (<g key={id} onClick={() => setCountry(id)} style={{ cursor: "pointer" }}>
                    <circle cx={55 + (p.lon + 20) * 6.3} cy={35 + (38 - p.lat) * 7} r="6" fill="#1672d4"/>
                    <text x={55 + (p.lon + 20) * 6.3 + 10} y={35 + (38 - p.lat) * 7 - 10} fontSize="15" fill="#183244">
                      {name}
                    </text>
                  </g>);
            })}
        </svg>
        <div className="map-buttons">
          {country
            ? places
                .filter((p) => p.country === country)
                .map((p) => (<GameButton key={p.id} onClick={() => travel(p.id)}>
                    {p.name} →
                  </GameButton>))
            : countries.map(([id, name]) => (<GameButton key={id} onClick={() => setCountry(id)}>
                  {name} →
                </GameButton>))}
        </div>
        {!country && (<GameButton className="remote" onClick={() => travel("remote")}>
            ✦ Work from anywhere →
          </GameButton>)}
        <small>
          Natural Earth country boundaries · Approximate city-centre coordinates
          · Fictional mission locations. Entering a destination does not verify
          presence.
        </small>
      </GameCard>
    </div>);
}
