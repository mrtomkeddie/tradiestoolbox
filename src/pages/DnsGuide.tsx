import { useSearchParams } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';

export default function DnsGuide() {
  const [params] = useSearchParams();

  const client     = params.get('client')     || '—';
  const domain     = params.get('domain')     || '—';
  const netlifyApp = params.get('netlifyApp') || '—';
  const netlifyIp  = params.get('netlifyIp')  || '75.2.60.5';

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300;1,9..40,400&display=swap');

        .dns-page { font-family: 'DM Sans', sans-serif; background: #f6f4f0; color: #0a0a0a; min-height: 100vh; -webkit-font-smoothing: antialiased; }
        .dns-wrap { max-width: 720px; margin: 0 auto; padding: 60px 32px 80px; }

        .dns-header { margin-bottom: 48px; padding-bottom: 32px; border-bottom: 1px solid #d6d2cc; }
        .dns-brand img { height: 40px; width: auto; display: block; margin-bottom: 24px; }

        .dns-header h1 { font-family: 'Instrument Serif', serif; font-size: 42px; line-height: 1.15; font-weight: 400; margin-bottom: 16px; }
        .dns-header h1 em { color: #c45d3e; font-style: italic; }
        .dns-subtitle { font-size: 16px; color: #8a8580; max-width: 520px; line-height: 1.6; }

        .dns-meta { margin-top: 24px; display: flex; gap: 24px; flex-wrap: wrap; }
        .dns-meta-item { font-size: 13px; color: #8a8580; }
        .dns-meta-item strong { color: #0a0a0a; font-weight: 500; }

        .dns-alert { background: #fff8f0; border: 1px solid #f0c097; border-radius: 12px; padding: 16px 20px; font-size: 14px; line-height: 1.6; margin-bottom: 48px; color: #7a3e1e; }

        .dns-section { margin-bottom: 56px; }
        .dns-label { font-size: 11px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: #c45d3e; margin-bottom: 8px; }
        .dns-section h2 { font-family: 'Instrument Serif', serif; font-size: 28px; font-weight: 400; margin-bottom: 16px; }
        .dns-section p { font-size: 15px; color: #3a3632; line-height: 1.7; margin-bottom: 12px; }

        .dns-steps { display: flex; flex-direction: column; gap: 24px; margin-top: 24px; }
        .dns-step { display: flex; gap: 20px; align-items: flex-start; }
        .dns-step-number { flex-shrink: 0; width: 36px; height: 36px; background: #0a0a0a; color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 14px; margin-top: 2px; }
        .dns-step-content h3 { font-size: 16px; font-weight: 600; margin-bottom: 8px; }
        .dns-step-content p { font-size: 14px; color: #5a5550; line-height: 1.65; margin-bottom: 8px; }
        .dns-note { font-size: 13px; color: #8a8580; font-style: italic; }

        .dns-table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 13px; }
        .dns-table th { background: #f0ede8; padding: 10px 14px; text-align: left; font-weight: 600; font-size: 12px; letter-spacing: 0.04em; border: 1px solid #d6d2cc; }
        .dns-table td { padding: 10px 14px; border: 1px solid #d6d2cc; }
        .dns-table td.dns-type { font-weight: 700; color: #c45d3e; }
        .dns-table code { font-family: 'Courier New', monospace; background: #f0ede8; padding: 2px 6px; border-radius: 4px; font-size: 12px; }

        .dns-registrar-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px; margin-top: 20px; }
        .dns-registrar-card { background: #fffefa; border: 1px solid #d6d2cc; border-radius: 10px; padding: 14px 16px; }
        .dns-registrar-card h4 { font-size: 14px; font-weight: 600; margin-bottom: 4px; }
        .dns-registrar-card p { font-size: 13px; color: #8a8580; margin: 0; }

        .dns-warning { background: #fff5f5; border: 1px solid #f5c0c0; border-radius: 12px; padding: 14px 18px; font-size: 14px; color: #7a1e1e; line-height: 1.6; margin-top: 20px; }

        .dns-checklist { list-style: none; padding: 0; margin-top: 16px; display: flex; flex-direction: column; gap: 10px; }
        .dns-checklist li { display: flex; align-items: flex-start; gap: 10px; font-size: 14px; color: #3a3632; line-height: 1.5; }
        .dns-checklist li::before { content: ''; flex-shrink: 0; width: 18px; height: 18px; border: 2px solid #d6d2cc; border-radius: 4px; margin-top: 1px; }

        .dns-footer { margin-top: 64px; padding-top: 24px; border-top: 1px solid #d6d2cc; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; }
        .dns-footer img { height: 28px; width: auto; }
        .dns-footer span { font-size: 13px; color: #8a8580; }

        @media (max-width: 600px) {
          .dns-wrap { padding: 40px 20px 60px; }
          .dns-header h1 { font-size: 32px; }
          .dns-registrar-grid { grid-template-columns: 1fr 1fr; }
        }
      `}</style>

      <div className="dns-page">
        <div className="dns-wrap">

          {/* Header */}
          <div className="dns-header">
            <div className="dns-brand">
              <img src="/ttlogo.svg" alt="TradersToolkit" />
            </div>
            <h1>Your site is built.<br />Let's get it <em>live.</em></h1>
            <p className="dns-subtitle">
              This guide walks you through the one thing we need from you — pointing your domain at your new website. It takes about 5 minutes.
            </p>
            <div className="dns-meta">
              <div className="dns-meta-item"><strong>Business:</strong> {client}</div>
              <div className="dns-meta-item"><strong>Domain:</strong> {domain}</div>
              <div className="dns-meta-item"><strong>Prepared by:</strong> TradersToolkit</div>
            </div>
          </div>

          {/* Alert */}
          <div className="dns-alert">
            <strong>Your site is already deployed and waiting.</strong> As soon as you complete step 3 below, it will be live at your domain. DNS changes can take up to 24 hours to fully propagate, but it's usually live within an hour.
          </div>

          {/* Section 1 */}
          <div className="dns-section">
            <div className="dns-label">A quick explanation</div>
            <h2>What you're actually doing</h2>
            <p>
              Your domain name (e.g. <strong>{domain}</strong>) is registered with a company called a domain registrar — whoever you bought it from. Right now it points nowhere useful. We need to update one setting to point it at your new website.
            </p>
            <p>
              Think of it like changing the address on a sat-nav. Your domain is the address; we're just telling it where to go. You don't need to understand the technical side — just follow the steps below.
            </p>
          </div>

          {/* Section 2: Steps */}
          <div className="dns-section">
            <div className="dns-label">Step by step</div>
            <h2>How to go live</h2>

            <div className="dns-steps">
              <div className="dns-step">
                <div className="dns-step-number">1</div>
                <div className="dns-step-content">
                  <h3>Log in to your domain registrar</h3>
                  <p>This is whoever you bought your domain from — GoDaddy, Namecheap, 123-reg, Ionos, or similar. If you're not sure who that is, check your email inbox for a receipt when you first bought the domain.</p>
                  <p className="dns-note">Can't find it? Reply to this message and we'll help you track it down.</p>
                </div>
              </div>

              <div className="dns-step">
                <div className="dns-step-number">2</div>
                <div className="dns-step-content">
                  <h3>Find your DNS settings</h3>
                  <p>Once logged in, look for a section called <strong>DNS</strong>, <strong>DNS Management</strong>, <strong>Name Servers</strong>, or <strong>Advanced DNS</strong>. It's usually under "My Domains" → click your domain → look for DNS or Manage.</p>
                </div>
              </div>

              <div className="dns-step">
                <div className="dns-step-number">3</div>
                <div className="dns-step-content">
                  <h3>Add or update these two records</h3>
                  <p>You need to add (or update if they already exist) the following DNS records exactly as shown:</p>

                  <table className="dns-table">
                    <thead>
                      <tr>
                        <th>Type</th>
                        <th>Name / Host</th>
                        <th>Value / Points To</th>
                        <th>TTL</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="dns-type">A</td>
                        <td>@</td>
                        <td><code>{netlifyIp}</code></td>
                        <td>3600</td>
                      </tr>
                      <tr>
                        <td className="dns-type">CNAME</td>
                        <td>www</td>
                        <td><code>{netlifyApp}</code></td>
                        <td>3600</td>
                      </tr>
                    </tbody>
                  </table>

                  <p className="dns-note" style={{ marginTop: 12 }}>
                    These values are specific to your site. If anything looks unclear, message us before making changes.
                  </p>
                </div>
              </div>

              <div className="dns-step">
                <div className="dns-step-number">4</div>
                <div className="dns-step-content">
                  <h3>Save and wait</h3>
                  <p>Save your changes. DNS updates usually take 30–60 minutes, but can occasionally take up to 24 hours. Once it's live, you'll see your new site at your domain.</p>
                  <p>Send us a message when you've made the change and we'll keep an eye on it from our end.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Registrars */}
          <div className="dns-section">
            <div className="dns-label">Where to find DNS settings</div>
            <h2>Common domain providers</h2>
            <p>Every registrar looks slightly different. Here's where to find DNS settings in the most common ones:</p>

            <div className="dns-registrar-grid">
              {[
                { name: 'GoDaddy',         path: 'My Products → DNS → Manage DNS' },
                { name: 'Namecheap',       path: 'Domain List → Manage → Advanced DNS' },
                { name: '123-reg',         path: 'Manage Domains → DNS → Manage DNS' },
                { name: 'Ionos (1&1)',     path: 'Domains → DNS → Edit DNS Settings' },
                { name: 'Fasthosts',       path: 'My Domains → DNS Records → Edit' },
                { name: 'Not listed here?',path: 'Search "[your provider] change DNS records" — or just message us.' },
              ].map(r => (
                <div key={r.name} className="dns-registrar-card">
                  <h4>{r.name}</h4>
                  <p>{r.path}</p>
                </div>
              ))}
            </div>

            <div className="dns-warning">
              <strong>Important:</strong> Do not change your nameservers unless we specifically ask you to. Only update the A record and CNAME record shown in step 3. Changing nameservers is a bigger change and can take your email offline.
            </div>
          </div>

          {/* Section 4: Checklist */}
          <div className="dns-section">
            <div className="dns-label">Before you start</div>
            <h2>Quick checklist</h2>
            <ul className="dns-checklist">
              <li>I know who my domain registrar is (GoDaddy, Namecheap, 123-reg, etc.)</li>
              <li>I have my login details for my domain registrar account</li>
              <li>I can see the DNS values filled in above (A record IP + CNAME)</li>
              <li>I have 5 minutes to make the changes</li>
            </ul>
          </div>

          {/* Section 5: Help */}
          <div className="dns-section">
            <div className="dns-label">Stuck?</div>
            <h2>We're here if you need us</h2>
            <p>If you get stuck at any point, just send us a message — text, voice note, or video — and we'll either walk you through it or ask for temporary access to do it for you.</p>
            <p>We don't do phone calls, but we respond fast and we'll get it sorted.</p>
          </div>

          {/* Footer */}
          <div className="dns-footer">
            <img src="/ttlogo.svg" alt="TradersToolkit" />
            <span>Questions? Message us anytime.</span>
          </div>

        </div>
      </div>
    </>
  );
}
