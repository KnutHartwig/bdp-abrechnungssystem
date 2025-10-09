export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-muted/50 mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-sm text-muted-foreground text-center md:text-left">
            <p>
              © {currentYear} BdP Landesverband Baden-Württemberg e.V.
            </p>
            <p className="mt-1">
              Alle Rechte vorbehalten.
            </p>
          </div>

          <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-6 text-sm text-center">
            <a
              href="https://www.bdp-bawue.de"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              BdP Baden-Württemberg
            </a>
            <a
              href="https://www.bdp.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              BdP Bundesverband
            </a>
            <a
              href="mailto:kasse@bdp-bawue.de"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Kontakt
            </a>
          </div>

          <div className="text-xs text-muted-foreground text-center md:text-right">
            <p>Abrechnungssystem v3.1</p>
            <p className="mt-1">
              Bei Fragen:{" "}
              <a
                href="mailto:kasse@bdp-bawue.de"
                className="hover:underline"
              >
                kasse@bdp-bawue.de
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
