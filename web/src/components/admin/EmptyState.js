"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmptyState = EmptyState;
const card_1 = require("@/components/ui/card");
const button_1 = require("@/components/ui/button");
const lucide_react_1 = require("lucide-react");
function EmptyState({ title, description, onRefresh, actionText = "Refrescar" }) {
    return (<div className="flex justify-center py-12">
      <card_1.Card className="max-w-md w-full">
        <card_1.CardHeader className="text-center">
          <card_1.CardTitle className="text-xl">{title}</card_1.CardTitle>
          <card_1.CardContent>
            <p className="text-muted-foreground text-sm">{description}</p>
          </card_1.CardContent>
        </card_1.CardHeader>
        {onRefresh && (<card_1.CardFooter>
            <button_1.Button onClick={onRefresh} className="w-full gap-2">
              <lucide_react_1.RefreshCw className="h-4 w-4"/>
              {actionText}
            </button_1.Button>
          </card_1.CardFooter>)}
      </card_1.Card>
    </div>);
}
