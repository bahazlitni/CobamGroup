import { Loader2 } from "lucide-react";
import { Button } from "../../ui/button";

export default function SaveButton({isSaving}: {isSaving: boolean}){
    return <Button
        type="submit"
        form="personal-details-form"
        disabled={isSaving}
        className="h-11 rounded-full bg-cobam-dark-blue px-5 text-sm font-medium text-white hover:bg-cobam-water-blue hover:text-white disabled:text-white"
    >
        {isSaving ? (
        <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Enregistrement...
        </>
        ) : (
        "Enregistrer"
        )}
    </Button>
}