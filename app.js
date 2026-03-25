/* ============================================
   VERABRIEF — app.js
   All logic & behavior lives here.
   HTML structure → index.html
   Visual styling → styles.css
   ============================================ */

/* ── SAMPLE REPORTS ── */
const samples = {
  ransomware: `INCIDENT REPORT — CRITICAL
Date: 2024-03-12 | Ticket: INC-2024-0891
Severity: P1 | Status: Active Containment

SUMMARY:
At 03:47 UTC, EDR detected LockBit 3.0 ransomware activity on FILESERVER-04 (10.0.1.47). Lateral movement confirmed via SMB to 3 additional hosts. Encryption process was interrupted at 34% completion. C2 communication detected to 185.220.101.x (Tor exit node).

INDICATORS OF COMPROMISE:
- SHA256: a3f8b2c1d4e5f6789012345678901234567890abcdef
- Mutex: Global\\{DECKARD-2024}
- Registry: HKLM\\SOFTWARE\\WOW6432Node\\[random]
- Affected: FILESERVER-04, WS-ACCT-12, WS-HR-07, DC-BACKUP-01

TECHNICAL FINDINGS:
Initial vector: phishing email with macro-enabled .xlsm attachment. Privilege escalation via CVE-2023-28252 (CLFS driver exploit). Persistence: scheduled task "WindowsUpdateService" every 15min. Data exfiltration suspected via rclone to Mega.nz prior to encryption.

RECOMMENDED TECHNICAL ACTIONS:
- Isolate affected subnets immediately
- Force password reset all AD accounts
- Block IOCs at perimeter firewall
- Preserve forensic images before remediation
- Engage IR retainer: CrowdStrike`,

  phishing: `SECURITY ALERT — HIGH PRIORITY
Alert ID: PHI-20240312-447
Detection Time: 14:23:07 UTC
Source: Microsoft Defender for Office 365

THREAT SUMMARY:
Business Email Compromise (BEC) campaign targeting finance department. 3 executives received spoofed emails from "CEO" requesting urgent wire transfer ($87,500). Sender domain: acme-corp-secure[.]com (registered 3 days ago). 2 of 3 recipients clicked embedded link. 1 recipient initiated wire transfer review process.

TECHNICAL INDICATORS:
- Spoofed From: ceo@acme-corp-secure.com
- Reply-To: ceo.payments@protonmail.com
- IP: 91.108.4.x (Netherlands VPS)
- Link: hxxps://acme-corp-secure[.]com/invoice/Q1-payment
- Credential harvest page mimicking Office 365 login

AFFECTED ACCOUNTS:
- finance@company.com — link clicked, credentials potentially compromised
- accounting@company.com — link clicked
- ap@company.com — reported suspicious, did not click

CONTAINMENT ACTIONS TAKEN:
- Emails quarantined from remaining inboxes
- Domain blocked at email gateway
- Active investigation: wire transfer status unknown`,

  vuln: `VULNERABILITY ASSESSMENT REPORT
Assessment Date: 2024-03-10 to 2024-03-12
Scope: External perimeter + internal network segment 10.0.2.0/24
Tool: Tenable Nessus Professional

EXECUTIVE FINDINGS:
Total vulnerabilities: 247
Critical: 12 | High: 43 | Medium: 89 | Low: 103

CRITICAL VULNERABILITIES (sample):
1. CVE-2024-21762 (CVSS 9.6) — FortiOS SSL-VPN out-of-bounds write. Unauthenticated RCE possible. Affects: FW-EDGE-01 (FortiOS 7.2.4). Patch available: 7.4.3.

2. CVE-2023-44487 (CVSS 7.5) — HTTP/2 Rapid Reset DDoS. Affects: web-prod-01, web-prod-02 (nginx 1.18.0). Patch: upgrade nginx.

3. MS17-010 (CVSS 9.3) — EternalBlue SMB vulnerability. Affects: LEGACY-SRV-03 (Windows Server 2008 R2). Critical: this host is unpatched and network-accessible.

COMPLIANCE GAPS:
- 3 systems running end-of-life OS (no vendor patches)
- SSL/TLS: TLS 1.0 still enabled on 6 hosts (PCI-DSS violation)
- Default credentials found on 2 network devices

REMEDIATION PRIORITY:
Immediate: patch FW-EDGE-01, isolate LEGACY-SRV-03
30 days: nginx upgrade, TLS hardening
90 days: EOL system replacement roadmap`,

  breach: `DATA BREACH NOTIFICATION — CONFIDENTIAL
Incident Classification: Personal Data Breach
Notification Trigger: GDPR Article 33 / HIPAA Breach Rule
Report Generated: 2024-03-12 09:00 UTC

INCIDENT OVERVIEW:
On 2024-03-09, an unauthorized actor accessed customer database DB-PROD-02 via compromised admin credentials. Access duration: approximately 6 hours (02:14 – 08:31 UTC). Exfiltration confirmed via anomalous egress traffic (14.3 GB to external IP 194.165.x.x).

AFFECTED DATA CATEGORIES:
- Full name + email: 41,832 records
- Date of birth: 38,104 records
- Home address: 29,441 records
- Payment card (last 4 digits only): 12,893 records
- Health insurance ID: 8,219 records (HIPAA-covered)

ROOT CAUSE:
Service account password reuse. Credentials exposed in prior third-party breach (HaveIBeenPwned confirmed). MFA was not enforced on admin accounts. No anomaly detection triggered until manual review.

REGULATORY OBLIGATIONS:
- GDPR: 72-hour notification deadline to supervisory authority = 2024-03-12 02:14 UTC (MISSED — immediate escalation required)
- HIPAA: HHS notification required within 60 days
- State breach laws: CA, NY, TX notification required`
};

/* ── BRIEF DATA ── */
const briefs = {
  ransomware: {
    risk: 'CRITICAL',
    riskClass: 'risk-critical',
    financial: '$2.4M+',
    financialSub: 'Potential exposure (ransom + recovery + downtime)',
    systems: '4 hosts',
    systemsSub: 'File server, 2 workstations, backup DC affected',
    window: '< 4 hrs',
    windowSub: 'Before encryption resumes if containment fails',
    compliance: 'HIGH',
    complianceSub: 'Potential HIPAA / PCI notification trigger',
    complianceColor: 'red',
    summary: 'A ransomware attack (LockBit 3.0) was detected and partially interrupted on your internal file server at 3:47 AM. The attacker entered through a malicious email attachment, gained administrator access, and began encrypting files across four systems including your backup server. Encryption was stopped at 34% completion. Data may have been copied to an external service before encryption began — if so, this triggers mandatory breach notification obligations.',
    actions: [
      'Disconnect the four affected systems from the network immediately — do not power them off',
      'Reset all employee passwords company-wide before 9 AM today',
      'Confirm with your IT team whether the backup server is still intact — this determines recovery timeline',
      'Contact your cyber insurance carrier now — most policies require notification within 24 hours of an incident',
      'Do not pay any ransom without consulting legal counsel and your insurance carrier first'
    ]
  },

  phishing: {
    risk: 'HIGH',
    riskClass: 'risk-high',
    financial: '$87,500',
    financialSub: 'Wire transfer pending — status unconfirmed',
    systems: '2 accounts',
    systemsSub: 'Credentials potentially stolen from finance team',
    window: 'NOW',
    windowSub: 'Stop wire transfer before it clears',
    compliance: 'MEDIUM',
    complianceSub: 'Credential theft may require breach notification',
    complianceColor: 'yellow',
    summary: 'Attackers impersonated your CEO via a fraudulent email domain registered three days ago, requesting an $87,500 wire transfer. Two finance team members clicked the link and likely had their login credentials stolen. One team member began processing the wire transfer — this must be stopped immediately. The stolen credentials give attackers access to your company email and potentially financial systems.',
    actions: [
      'Call your bank NOW and request a hold on any pending wire transfers initiated in the last 24 hours',
      'Force a password reset on all finance and accounting email accounts before staff logs in today',
      'Enable multi-factor authentication on all accounts that don\'t already have it — especially email and banking',
      'Have your IT team check whether the attackers accessed any email, files, or systems using the stolen credentials',
      'Brief all staff: confirm any urgent payment requests by phone before acting, even if from the CEO'
    ]
  },

  vuln: {
    risk: 'HIGH',
    riskClass: 'risk-high',
    financial: '$850K',
    financialSub: 'Avg. breach cost for orgs with unpatched critical CVEs',
    systems: '12 critical',
    systemsSub: 'Vulnerabilities identified, 3 immediately exploitable',
    window: '48 hrs',
    windowSub: 'Patch FortiGate firewall before active exploitation',
    compliance: 'PCI FAIL',
    complianceSub: 'TLS 1.0 on 6 hosts violates current standards',
    complianceColor: 'red',
    summary: 'A security scan of your network found 247 vulnerabilities, including 12 critical issues that attackers could use to take over your systems. Most urgently: your external firewall has a known vulnerability being actively exploited by ransomware groups worldwide, and one internal server (Windows 2008) has not been patched since 2017 and is directly exposed to your network. Additionally, outdated encryption settings on six systems put you out of compliance with payment card security standards.',
    actions: [
      'Patch the FortiGate firewall this week — your IT team or vendor can do this in a maintenance window',
      'Isolate the Windows 2008 server from the network today; plan its full replacement within 90 days',
      'Schedule TLS 1.0 disablement on all six affected servers — your IT team needs 2–4 hours per server',
      'Approve budget for emergency patching sprint: estimated 40–60 IT hours over the next 30 days',
      'Request a re-scan confirmation after critical patches are applied to verify remediation'
    ]
  },

  breach: {
    risk: 'CRITICAL',
    riskClass: 'risk-critical',
    financial: '$3.1M+',
    financialSub: 'Regulatory fines + notification + litigation exposure',
    systems: '41,832',
    systemsSub: 'Customer records confirmed exfiltrated',
    window: 'OVERDUE',
    windowSub: 'GDPR 72-hr notification window has passed',
    compliance: 'BREACH',
    complianceSub: 'GDPR + HIPAA + 3 state laws triggered',
    complianceColor: 'red',
    summary: 'Customer data including names, addresses, birthdates, and health insurance IDs for over 41,000 people was stolen from your database. The attacker used a compromised password to access systems for six hours, copying 14 GB of data. The EU\'s 72-hour breach notification deadline has already passed, creating immediate regulatory exposure. HIPAA notification to the federal government is required within 60 days. California, New York, and Texas consumer notification laws are also triggered.',
    actions: [
      'Contact your data breach attorney today — regulatory deadlines have been missed and legal strategy is urgent',
      'Notify your cyber insurance carrier immediately — breach response costs are time-sensitive to cover',
      'Prepare customer notification letters — your attorney will guide content, but drafting should start now',
      'Mandate multi-factor authentication on all admin accounts before end of business today',
      'File GDPR supervisory authority notification as soon as possible — delay increases fine exposure significantly'
    ]
  }
};

/* ── LOAD SAMPLE ── */
function loadSample(type) {
  document.getElementById('reportInput').value = samples[type];
}

/* ── TRANSLATE ── */
async function translate() {
  const input = document.getElementById('reportInput').value.trim();
  if (!input) return;

  const btn     = document.getElementById('translateBtn');
  const btnText = document.getElementById('btnText');
  const spinner = document.getElementById('spinner');

  btn.disabled          = true;
  btnText.textContent   = 'Analyzing report...';
  spinner.style.display = 'block';

  try {
    const response = await fetch('/translate', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ reportText: input })
    });

    const data = await response.json();

    if (!response.ok || data.error) {
      alert(data.error || 'Translation failed. Please try again.');
      return;
    }

    renderBrief(data);

  } catch (err) {
    console.error('Error:', err);
    alert('Network error. Make sure the server is running with: node server.js');
  } finally {
    btn.disabled          = false;
    btnText.textContent   = 'Generate Executive Brief';
    spinner.style.display = 'none';
  }

}

/* ── RENDER BRIEF ── */
function renderBrief(d) {
  document.getElementById('outputEmpty').style.display = 'none';

  const now = new Date();
  document.getElementById('briefDate').textContent = now.toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });

  const rb      = document.getElementById('riskBadge');
  rb.textContent = 'Risk: ' + d.risk;
  rb.className   = 'risk-badge ' + d.riskClass;

  document.getElementById('impactFinancial').textContent    = d.financial;
  document.getElementById('impactFinancialSub').textContent = d.financialSub;
  document.getElementById('impactSystems').textContent      = d.systems;
  document.getElementById('impactSystemsSub').textContent   = d.systemsSub;
  document.getElementById('impactWindow').textContent       = d.window;
  document.getElementById('impactWindowSub').textContent    = d.windowSub;

  const ic      = document.getElementById('impactCompliance');
  ic.textContent = d.compliance;
  ic.className   = 'impact-value ' + (d.complianceColor || 'red');
  document.getElementById('impactComplianceSub').textContent = d.complianceSub;

  document.getElementById('execSummary').textContent = d.summary;

  const al = document.getElementById('actionsList');
  al.innerHTML = '';
  d.actions.forEach((action, i) => {
    al.innerHTML += `
      <li>
        <span class="action-num">${i + 1}</span>
        <span>${action}</span>
      </li>`;
  });

  const brief   = document.getElementById('briefOutput');
  brief.className = 'brief visible fade-in';
}

/* ── WAITLIST SUBMIT ── */
function joinWaitlist(e) {
  e.preventDefault();
  const btn  = document.getElementById('wlBtn');
  const meta = document.getElementById('wlMeta');

  btn.textContent        = '✓ You\'re on the list';
  btn.style.background   = 'rgba(0,184,214,0.2)';
  btn.style.color        = 'var(--accent)';
  btn.style.border       = '1px solid rgba(0,184,214,0.4)';
  btn.disabled           = true;
  meta.textContent       = "We'll be in touch when your spot opens up.";
}