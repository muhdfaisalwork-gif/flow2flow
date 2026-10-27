import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ShieldCheck, Copy, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";

const apacheLicenseText = `                                 Apache License
                           Version 2.0, January 2004
                        http://www.apache.org/licenses/

   TERMS AND CONDITIONS FOR USE, REPRODUCTION, AND DISTRIBUTION

   1. Definitions.
      "License" shall mean the terms and conditions for use, reproduction,
      and distribution as defined by Sections 1 through 9 of this document.

      "Licensor" shall mean the copyright owner or entity authorized by
      the copyright owner that is granting the License.

   2. Grant of Copyright License. Subject to the terms and conditions of
      this License, each Contributor hereby grants to You a perpetual,
      worldwide, non-exclusive, no-charge, royalty-free, irrevocable
      copyright license to reproduce, prepare Derivative Works of,
      publicly display, publicly perform, sublicense, and distribute the
      Work and such Derivative Works in Source or Object form.

   3. Grant of Patent License. Subject to the terms and conditions of
      this License, each Contributor hereby grants to You a perpetual,
      worldwide, non-exclusive, no-charge, royalty-free, irrevocable
      patent license to make, have made, use, offer to sell, sell, import,
      and otherwise transfer the Work.

   4. Redistribution. You may reproduce and distribute copies of the
      Work or Derivative Works thereof in any medium, with or without
      modifications, and in Source or Object form, provided that You
      meet the following conditions:
      (a) You must give any other recipients of the Work a copy of this License;
      (b) You must cause any modified files to carry prominent notices stating
          that You changed the files; and
      (c) You must retain, in the Source form of any Derivative Works that You
          distribute, all copyright, patent, trademark, and attribution notices.

   7. Disclaimer of Warranty. Unless required by applicable law or
      agreed to in writing, Licensor provides the Work (and each
      Contributor provides its Contributions) on an "AS IS" BASIS,
      WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
      implied, including, without limitation, any warranties or conditions
      of TITLE, NON-INFRINGEMENT, MERCHANTABILITY, or FITNESS FOR A
      PARTICULAR PURPOSE.

   8. Limitation of Liability. In no event and under no legal theory,
      whether in tort (including negligence), contract, or otherwise,
      shall any Contributor be liable to You for damages, including any
      direct, indirect, special, incidental, or consequential damages of
      any character arising as a result of this License or out of the
      use or inability to use the Work.

   END OF TERMS AND CONDITIONS`;

export default function License() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />

      <main className="flex-1 pt-24 pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          {/* Header */}
          <div className="mb-12 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              OSI-Approved Open Source License
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Apache License 2.0</h1>
            <p className="text-xs text-muted-foreground">
              Shadow Flow is 100% free and open-source software. Build whatever you want with complete legal peace of mind.
            </p>
          </div>

          {/* Quick Summary Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {/* Permissions */}
            <Card className="border-border bg-card/60">
              <CardContent className="p-5 space-y-2.5">
                <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Permissions
                </div>
                <ul className="space-y-1.5 text-xs text-foreground/80">
                  <li>✔ Commercial use</li>
                  <li>✔ Modification</li>
                  <li>✔ Distribution</li>
                  <li>✔ Sublicensing</li>
                  <li>✔ Private & Air-gapped use</li>
                  <li>✔ Patent grant</li>
                </ul>
              </CardContent>
            </Card>

            {/* Conditions */}
            <Card className="border-border bg-card/60">
              <CardContent className="p-5 space-y-2.5">
                <div className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" /> Conditions
                </div>
                <ul className="space-y-1.5 text-xs text-foreground/80">
                  <li>ℹ License and copyright notice</li>
                  <li>ℹ State changes on modified files</li>
                </ul>
              </CardContent>
            </Card>

            {/* Limitations */}
            <Card className="border-border bg-card/60">
              <CardContent className="p-5 space-y-2.5">
                <div className="text-xs font-bold text-destructive uppercase tracking-wider flex items-center gap-1.5">
                  <XCircle className="w-4 h-4" /> Limitations
                </div>
                <ul className="space-y-1.5 text-xs text-foreground/80">
                  <li>✖ No trademark rights</li>
                  <li>✖ No warranty provided</li>
                  <li>✖ No maintainer liability</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Full Text */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-foreground">Official License Full Text</h3>
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-7 gap-1.5"
                onClick={() => {
                  navigator.clipboard.writeText(apacheLicenseText);
                  toast.success("License text copied to clipboard!");
                }}
              >
                <Copy className="w-3.5 h-3.5" /> Copy Text
              </Button>
            </div>

            <pre className="p-5 rounded-xl bg-muted/60 border border-border text-xs font-mono text-muted-foreground overflow-x-auto leading-relaxed">
              <code>{apacheLicenseText}</code>
            </pre>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
