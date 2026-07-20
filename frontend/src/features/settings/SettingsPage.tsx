import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LeadSourcesSettings } from "./LeadSourcesSettings"
import { LeadStagesSettings } from "./LeadStagesSettings"
import { CountriesSettings } from "./CountriesSettings"
import { CitiesSettings } from "./CitiesSettings"
import { CompanyProfileSettings } from "./CompanyProfileSettings"

export function SettingsPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
      <p className="text-muted-foreground">Configure lookups and company details.</p>

      <Tabs defaultValue="company" className="mt-6">
        <TabsList>
          <TabsTrigger value="company">Company</TabsTrigger>
          <TabsTrigger value="stages">Lead Stages</TabsTrigger>
          <TabsTrigger value="sources">Lead Sources</TabsTrigger>
          <TabsTrigger value="countries">Countries</TabsTrigger>
          <TabsTrigger value="cities">Cities</TabsTrigger>
        </TabsList>

        <TabsContent value="company">
          <CompanyProfileSettings />
        </TabsContent>
        <TabsContent value="stages">
          <LeadStagesSettings />
        </TabsContent>
        <TabsContent value="sources">
          <LeadSourcesSettings />
        </TabsContent>
        <TabsContent value="countries">
          <CountriesSettings />
        </TabsContent>
        <TabsContent value="cities">
          <CitiesSettings />
        </TabsContent>
      </Tabs>
    </div>
  )
}
