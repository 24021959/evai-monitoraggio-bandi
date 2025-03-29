
import { Cliente } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, MapPin, Tag, Euro, Award, Briefcase, Mail, Phone, Calendar } from 'lucide-react';

interface ClienteCardProps {
  cliente: Cliente;
}

const ClienteCard: React.FC<ClienteCardProps> = ({ cliente }) => {
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{cliente.nome}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-start gap-2">
          <Building2 className="h-4 w-4 text-gray-500 mt-0.5" />
          <div>
            <p className="text-sm font-medium">Settore</p>
            <p className="text-sm text-gray-600">{cliente.settore}</p>
          </div>
        </div>
        
        <div className="flex items-start gap-2">
          <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
          <div>
            <p className="text-sm font-medium">Sede</p>
            <p className="text-sm text-gray-600">{cliente.regione}, {cliente.provincia}</p>
          </div>
        </div>
        
        <div className="flex items-start gap-2">
          <Mail className="h-4 w-4 text-gray-500 mt-0.5" />
          <div>
            <p className="text-sm font-medium">Email</p>
            <p className="text-sm text-gray-600">{cliente.email}</p>
          </div>
        </div>
        
        {cliente.telefono && (
          <div className="flex items-start gap-2">
            <Phone className="h-4 w-4 text-gray-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium">Telefono</p>
              <p className="text-sm text-gray-600">{cliente.telefono}</p>
            </div>
          </div>
        )}
        
        <div className="flex items-start gap-2">
          <Euro className="h-4 w-4 text-gray-500 mt-0.5" />
          <div>
            <p className="text-sm font-medium">Fatturato</p>
            <p className="text-sm text-gray-600">
              {cliente.fatturato ? `€${cliente.fatturato.toLocaleString('it-IT')}` : '-'}
            </p>
          </div>
        </div>

        {cliente.dipendenti && (
          <div className="flex items-start gap-2">
            <Building2 className="h-4 w-4 text-gray-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium">Dipendenti</p>
              <p className="text-sm text-gray-600">{cliente.dipendenti}</p>
            </div>
          </div>
        )}

        {cliente.annoFondazione && (
          <div className="flex items-start gap-2">
            <Calendar className="h-4 w-4 text-gray-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium">Anno fondazione</p>
              <p className="text-sm text-gray-600">{cliente.annoFondazione}</p>
            </div>
          </div>
        )}

        {cliente.faseDiCrescita && (
          <div className="flex items-start gap-2">
            <Briefcase className="h-4 w-4 text-gray-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium">Fase</p>
              <p className="text-sm text-gray-600">
                {cliente.faseDiCrescita === 'startup' && 'Startup'}
                {cliente.faseDiCrescita === 'scaleup' && 'Scale-up'}
                {cliente.faseDiCrescita === 'matura' && 'Azienda Matura'}
                {cliente.faseDiCrescita === 'consolidata' && 'Azienda Consolidata'}
              </p>
            </div>
          </div>
        )}

        {cliente.certificazioni && (
          <div className="flex items-start gap-2">
            <Award className="h-4 w-4 text-gray-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium">Certificazioni</p>
              <p className="text-sm text-gray-600">{cliente.certificazioni}</p>
            </div>
          </div>
        )}
        
        <div className="flex items-start gap-2">
          <Tag className="h-4 w-4 text-gray-500 mt-0.5" />
          <div>
            <p className="text-sm font-medium">Interessi</p>
            <div className="flex flex-wrap gap-1 mt-1">
              {(cliente.interessiSettoriali?.length || cliente.interessisettoriali?.length) ? (
                (cliente.interessiSettoriali || cliente.interessisettoriali || []).map((interesse, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {interesse}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-gray-400">Nessun interesse specificato</span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ClienteCard;
