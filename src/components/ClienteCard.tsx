
import { Cliente } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, MapPin, Tag, Euro } from 'lucide-react';

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
          <Euro className="h-4 w-4 text-gray-500 mt-0.5" />
          <div>
            <p className="text-sm font-medium">Fatturato</p>
            <p className="text-sm text-gray-600">€{cliente.fatturato.toLocaleString('it-IT')}</p>
          </div>
        </div>
        
        <div className="flex items-start gap-2">
          <Tag className="h-4 w-4 text-gray-500 mt-0.5" />
          <div>
            <p className="text-sm font-medium">Interessi</p>
            <div className="flex flex-wrap gap-1 mt-1">
              {cliente.interessiSettoriali.map((interesse, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {interesse}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ClienteCard;
