import { useState } from 'react';

interface Spec {
  label: string;
  value: string;
}

interface Unit {
  id: string;
  name: string;
  role: string;
  specs: Spec[];
  note: string;
  image?: string;
  imageAlt?: string;
}

const UNITS: Unit[] = [
  {
    id: 'mainstage',
    name: 'MAINSTAGE RIG',
    role: 'FLY-IN GIGS',
    specs: [
      { label: 'HOST', value: 'Apple MainStage' },
      { label: 'MACHINE', value: 'MacBook Pro M4 Pro · 48GB' },
      { label: 'PIANO', value: 'Synthogy Ivory Upright' },
      { label: 'ORCHESTRAL', value: 'EastWest Hollywood Opus Edition' },
      { label: 'MELLOTRON', value: 'Arturia Mellotron VST' },
      { label: 'WORKSTATION', value: 'Roland Fantom-S' },
      { label: 'EVERYTHING ELSE', value: 'NI Komplete 15' },
    ],
    note: 'The software rig for fly-in dates — when the gig is a flight away, the laptop and the libraries do the heavy lifting.',
  },
  {
    id: 'kronos',
    name: 'KORG KRONOS',
    role: 'REGIONAL SHOWS',
    specs: [
      { label: 'UNIT', value: 'Korg Kronos workstation' },
      { label: 'DUTY', value: 'Primary board for drivable dates' },
      { label: 'RANGE', value: '~3–4 hr radius of North Jersey' },
    ],
    note: 'When the show is within driving distance, real hardware comes along. The Kronos anchors the regional rig.',
  },
  {
    id: 'nord',
    name: 'NORD ELECTRO 5',
    role: 'REGIONAL SHOWS',
    specs: [
      { label: 'UNIT', value: 'Nord Electro 5' },
      { label: 'DUTY', value: 'Second tier — organs, EPs, clav' },
      { label: 'PAIRED WITH', value: 'Korg Kronos' },
    ],
    note: 'The red one. Pairs with the Kronos on regional dates for the voices that deserve their own board.',
  },
  {
    id: 'guitar',
    name: 'GUITARS',
    role: 'ELECTRIC — TELES & STRAT',
    specs: [
      { label: 'MAIN', value: 'Fender Custom Telecaster' },
      { label: 'VINTAGE', value: "Fender American Vintage '64 Telecaster" },
      { label: 'CUSTOM SHOP', value: 'Fender Custom Shop American Stratocaster' },
    ],
    note: "Keys are the main chair, but the guitar is part of the job too — a pair of Telecasters, a Custom Shop Strat, and a pedalboard built for the set.",
    image: 'GEAR_PEDALBOARD',
    imageAlt: "Jon Wolf's guitar pedalboard",
  },
];

interface Props {
  /** Root-relative src for the pedalboard photo, passed from the page. */
  pedalboardSrc?: string;
}

/**
 * RigExplorer — the /music/ centerpiece, styled as a tech rider.
 * Tabbed unit selector; selecting a unit reveals its spec sheet in mono type.
 */
export default function RigExplorer({ pedalboardSrc }: Props) {
  const [active, setActive] = useState<string>(UNITS[0]!.id);
  const unit = UNITS.find((u) => u.id === active) ?? UNITS[0]!;
  const imageSrc = unit.image === 'GEAR_PEDALBOARD' ? pedalboardSrc : unit.image;

  return (
    <div className="rig">
      <div className="rig__head">
        <span className="rig__title">TECH RIDER — JON WOLF</span>
        <span className="rig__rev">REV 2026.06</span>
      </div>

      <div className="rig__tabs" role="tablist" aria-label="Rig units">
        {UNITS.map((u) => (
          <button
            key={u.id}
            role="tab"
            id={'rig-tab-' + u.id}
            aria-selected={u.id === active}
            aria-controls={'rig-panel-' + u.id}
            className={'rig__tab' + (u.id === active ? ' is-active' : '')}
            onClick={() => setActive(u.id)}
          >
            {u.name}
          </button>
        ))}
      </div>

      <div
        className="rig__panel"
        role="tabpanel"
        id={'rig-panel-' + unit.id}
        aria-labelledby={'rig-tab-' + unit.id}
        key={unit.id}
      >
        <p className="rig__role">{unit.role}</p>
        <dl className="rig__specs">
          {unit.specs.map((s) => (
            <div className="rig__spec" key={s.label + s.value}>
              <dt>{s.label}</dt>
              <dd>{s.value}</dd>
            </div>
          ))}
        </dl>
        <p className="rig__note">{unit.note}</p>
        {imageSrc ? (
          <img className="rig__image" src={imageSrc} alt={unit.imageAlt ?? ''} loading="lazy" />
        ) : null}
      </div>
    </div>
  );
}
