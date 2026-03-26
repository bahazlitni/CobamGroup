import { MapPin, Phone, Clock, ExternalLink } from "lucide-react";


const SHOWROOMS: Record<
  string,
  {
    name: string;
    address: string;
    phone: string;
    hours: string;
    mapQuery: string;
  }
> = {
  "houmt-souk": {
    name: "Cobam Houmt Souk",
    address: "Houmt Souk, Djerba, Tunisie",
    phone: "+216 26 833 101",
    hours: "Lun–Sam : 8h00–18h00",
    mapQuery: "COBAM+Group+(Maison+&+Decors)+Djerba+Tunisia",
  },
  midoun: {
    name: "Cobam Midoun",
    address: "Midoun, Djerba, Tunisie",
    phone: "+216 26 833 104",
    hours: "Lun–Sam : 8h00–18h00",
    mapQuery: "Cobam+Midoun+Djerba+Tunisia",
  },
  centrale: {
    name: "Cobam Central",
    address: "Tunis Centre, Tunisie",
    phone: "+216 26 833 102",
    hours: "Lun–Sam : 8h00–18h00",
    mapQuery: "Cobam+Group-Siege+Djerba+Tunisia",
  },
  ceram: {
    name: "Cobam Céram",
    address: "Zone Industrielle, Djerba, Tunisie",
    phone: "+216 26 833 103",
    hours: "Lun–Sam : 8h00–18h00",
    mapQuery: "Cobam+Ceram+Djerba+Tunisia",
  },
};

interface ShowroomCardProps {
  location: string;
}

export default function ShowroomCard({ location }: ShowroomCardProps) {
  const { name, address, phone, hours, mapQuery } = SHOWROOMS[location];

  const embedUrl = `https://maps.google.com/maps?q=${mapQuery}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${mapQuery}`;

  return (
    <div className="group bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
      {/* Embedded Map */}
      <div className="relative h-48 w-full overflow-hidden bg-cobam-light-bg">
        <iframe
          src={embedUrl}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen={false}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title={`Carte - ${name}`}
          className="absolute inset-0 w-full h-full"
        />
      </div>

      {/* Info */}
      <div className="p-5 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-cobam-dark-blue font-bold text-base leading-tight group-hover:text-cobam-water-blue transition-colors">
            {name}
          </h3>
          <div className="bg-cobam-water-blue/10 text-cobam-water-blue rounded-lg p-1.5 flex-shrink-0">
            <MapPin size={14} />
          </div>
        </div>

        <div className="flex flex-col gap-2 text-sm text-cobam-carbon-grey">
          <div className="flex items-start gap-2">
            <MapPin size={13} className="mt-0.5 flex-shrink-0 text-cobam-quill-grey" />
            <span>{address}</span>
          </div>
          <a
            href={`tel:${phone}`}
            className="flex items-center gap-2 hover:text-cobam-water-blue transition-colors"
          >
            <Phone size={13} className="flex-shrink-0 text-cobam-quill-grey" />
            <span>{phone}</span>
          </a>
          <div className="flex items-center gap-2">
            <Clock size={13} className="flex-shrink-0 text-cobam-quill-grey" />
            <span>{hours}</span>
          </div>
        </div>

        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 w-full text-center text-xs font-bold text-cobam-water-blue border border-cobam-water-blue/30 hover:bg-cobam-water-blue hover:text-white rounded-lg py-2 transition-all"
        >
          Obtenir l'itinéraire →
        </a>
      </div>
    </div>
  );
}
