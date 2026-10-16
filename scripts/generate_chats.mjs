import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(__dirname, '../public/images');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

const chats = [
  {
    id: 'chat-1',
    participant: 'Spouse (Participant #34)',
    status: 'online',
    date: 'TODAY',
    recordId: 'IRB-REC #842 • COGNITIVE EXHAUSTION & SILENT WITHDRAWAL',
    messages: [
      { sender: 'them', time: '19:42', text: "Are you on your way home? Dinner's been ready since 7." },
      { sender: 'me', time: '20:15', text: "Still stuck at desk. Something urgent came up. Don't wait up." },
      { sender: 'them', time: '20:18', text: "You didn't even drop a text. I took leave early today specifically so we could talk about the weekend." },
      { sender: 'me', time: '20:45', text: "I was in back-to-back reviews. I can't check my phone every 10 minutes when executives are presenting." },
      { sender: 'them', time: '21:02', text: "It's not just today. For two weeks now, whenever I ask you anything about us, you shut down or say you're tired. I feel like I'm living with a ghost." },
      { sender: 'me', time: '21:14', text: "I'm doing everything I can to keep this family afloat financially. Why is it never enough for you?" },
      { sender: 'them', time: '21:19', text: "Because money doesn't talk to me. I just needed you to show up." }
    ]
  },
  {
    id: 'chat-2',
    participant: 'Spouse (Participant #12)',
    status: 'last seen today at 15:38',
    date: 'YESTERDAY',
    recordId: 'IRB-REC #612 • IN-LAW BOUNDARY FRICTION & LOYALTY BIND',
    messages: [
      { sender: 'them', time: '14:30', text: "Your mom called again. She wants us over this Sunday for the full day function." },
      { sender: 'me', time: '14:48', text: "Okay, so let's go. It's just one Sunday." },
      { sender: 'them', time: '14:52', text: "We already planned our doctor's appointment and grocery run. We haven't had a single quiet Sunday in a month." },
      { sender: 'me', time: '15:05', text: "It's family. You know how she gets if we make excuses. Just reschedule the clinic." },
      { sender: 'them', time: '15:12', text: "Every single time your family calls, our plans evaporate. You never stand up to them. Why do I always have to be the one who adjusts?" },
      { sender: 'me', time: '15:30', text: "Please don't start this while I'm at work. You're putting me between you and my mother." },
      { sender: 'them', time: '15:35', text: "I'm not putting you in between. You're already choosing." }
    ]
  },
  {
    id: 'chat-3',
    participant: 'Spouse (Participant #89)',
    status: 'online',
    date: 'TODAY',
    recordId: 'IRB-REC #189 • UNSHARED PARENTAL LOAD & RESENTMENT',
    messages: [
      { sender: 'them', time: '11:15', text: "Did you remember to email the pediatrician the medical history form? The deadline was 10 AM." },
      { sender: 'me', time: '11:32', text: "Forgot. Was leading the sprint planning. Can you do it?" },
      { sender: 'them', time: '11:36', text: "I asked you 3 times yesterday. I also handled preschool drop-off, lunchboxes, and my own client deck." },
      { sender: 'me', time: '11:41', text: "I told you I was overwhelmed this week. Why do you always list everything you do like a scorecard?" },
      { sender: 'them', time: '11:45', text: "Because if I don't remember it, nobody does. The mental load is crushing me and you act like I'm attacking you when I ask for basic help." },
      { sender: 'me', time: '11:58', text: "I'm trying. But whatever I do is never done the 'right way' according to you. So I'd rather you just tell me what to do." },
      { sender: 'them', time: '12:04', text: "That's the problem. I don't want to be your manager. I want an equal partner." }
    ]
  }
];

function generateHtml(chat) {
  const messagesHtml = chat.messages.map(m => {
    const isMe = m.sender === 'me';
    const checkSvg = isMe ? `<svg style="display:inline-block;vertical-align:-1px;margin-left:4px" width="16" height="11" viewBox="0 0 16 11" fill="none"><path d="M11.05 0.7L4.7 7.05L2.15 4.5L0.75 5.9L4.7 9.85L12.45 2.1L11.05 0.7Z" fill="#53bdeb"/><path d="M14.55 0.7L8.2 7.05L7.4 6.25L6 7.65L8.2 9.85L15.95 2.1L14.55 0.7Z" fill="#53bdeb"/></svg>` : '';
    return `
      <div style="display:flex; justify-content:${isMe ? 'flex-end' : 'flex-start'}; margin-bottom:12px; width:100%;">
        <div style="
          max-width:78%;
          background:${isMe ? '#005c4b' : '#202c33'};
          color:#e9edef;
          padding:10px 14px;
          border-radius:${isMe ? '12px 12px 2px 12px' : '12px 12px 12px 2px'};
          box-shadow:0 1px 2px rgba(0,0,0,0.3);
          position:relative;
          font-size:15px;
          line-height:1.45;
          letter-spacing:0.1px;
        ">
          <div>${m.text}</div>
          <div style="
            text-align:right;
            font-size:11px;
            color:${isMe ? 'rgba(233,237,239,0.7)' : '#8696a0'};
            margin-top:4px;
            display:flex;
            align-items:center;
            justify-content:flex-end;
          ">
            <span>${m.time}</span>
            ${checkSvg}
          </div>
        </div>
      </div>
    `;
  }).join('');

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
  body {
    background: #0b141a;
    width: 720px;
    height: 1080px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    position: relative;
    user-select: none;
  }
  .status-bar {
    height: 32px;
    background: #1f2c34;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 16px;
    color: #aebac1;
    font-size: 13px;
    font-weight: 500;
  }
  .header {
    height: 64px;
    background: #1f2c34;
    display: flex;
    align-items: center;
    padding: 0 16px;
    color: #e9edef;
    border-bottom: 1px solid rgba(255,255,255,0.06);
  }
  .avatar {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: #6b7c85;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 14px 0 8px;
    color: white;
    font-weight: 600;
    font-size: 18px;
  }
  .contact-info {
    flex: 1;
  }
  .contact-name {
    font-size: 17px;
    font-weight: 600;
    color: #e9edef;
  }
  .contact-status {
    font-size: 13px;
    color: #8696a0;
    margin-top: 2px;
  }
  .header-icons {
    display: flex;
    gap: 20px;
    color: #aebac1;
    font-size: 20px;
  }
  .chat-body {
    flex: 1;
    padding: 18px 20px;
    display: flex;
    flex-direction: column;
    background-color: #0b141a;
    background-image: radial-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 0);
    background-size: 24px 24px;
    overflow: hidden;
  }
  .lock-banner {
    background: #182229;
    border: 1px solid rgba(255,210,121,0.2);
    border-radius: 8px;
    padding: 10px 14px;
    margin: 0 auto 16px auto;
    max-width: 90%;
    text-align: center;
    font-size: 12px;
    color: #ffd279;
    line-height: 1.4;
    box-shadow: 0 1px 3px rgba(0,0,0,0.3);
  }
  .date-pill {
    background: #182229;
    color: #8696a0;
    font-size: 12px;
    font-weight: 600;
    padding: 5px 12px;
    border-radius: 6px;
    align-self: center;
    margin-bottom: 16px;
    letter-spacing: 0.5px;
    text-transform: uppercase;
  }
  .input-bar {
    height: 72px;
    background: #1f2c34;
    display: flex;
    align-items: center;
    padding: 0 14px;
    gap: 10px;
  }
  .input-box {
    flex: 1;
    height: 48px;
    background: #2a3942;
    border-radius: 24px;
    display: flex;
    align-items: center;
    padding: 0 16px;
    gap: 12px;
    color: #8696a0;
    font-size: 15px;
  }
  .mic-button {
    width: 48px;
    height: 48px;
    background: #00a884;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
  }
  .academic-tag {
    position: absolute;
    bottom: 80px;
    right: 20px;
    background: rgba(0,0,0,0.7);
    border: 1px solid rgba(255,255,255,0.15);
    padding: 4px 10px;
    border-radius: 4px;
    color: #8696a0;
    font-size: 11px;
    font-family: monospace;
  }
</style>
</head>
<body>
  <div class="status-bar">
    <span>09:41</span>
    <div style="display:flex;gap:6px;align-items:center;">
      <span>📶 5G</span>
      <span>87% 🔋</span>
    </div>
  </div>

  <div class="header">
    <div style="font-size:20px;color:#aebac1;cursor:pointer;">←</div>
    <div class="avatar">${chat.participant.charAt(0)}</div>
    <div class="contact-info">
      <div class="contact-name">${chat.participant}</div>
      <div class="contact-status">${chat.status}</div>
    </div>
    <div class="header-icons">
      <span>📹</span>
      <span>📞</span>
      <span>⋮</span>
    </div>
  </div>

  <div class="chat-body">
    <div class="lock-banner">
      🔒 <strong>Qualitative Research Telemetry</strong>: End-to-end encrypted transcript.<br>
      <span style="opacity:0.85;">${chat.recordId}</span>
    </div>

    <div class="date-pill">${chat.date}</div>

    ${messagesHtml}

    <div class="academic-tag">ANONYMIZED DISCORD LOG • PHD DATA CORPUS</div>
  </div>

  <div class="input-bar">
    <div class="input-box">
      <span>😊</span>
      <span style="flex:1;">Message</span>
      <span>📎</span>
      <span>📷</span>
    </div>
    <div class="mic-button">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
        <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
        <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
      </svg>
    </div>
  </div>
</body>
</html>`;
}

const chromePath = 'C:/Program Files/Google/Chrome/Application/chrome.exe';

for (const chat of chats) {
  const html = generateHtml(chat);
  const tempHtmlPath = path.resolve(__dirname, `temp_${chat.id}.html`);
  const outputPath = path.resolve(publicDir, `${chat.id}.png`);
  
  fs.writeFileSync(tempHtmlPath, html, 'utf8');
  
  console.log(`Rendering ${chat.id} with Chrome headless...`);
  const fileUrl = 'file:///' + tempHtmlPath.replace(/\\/g, '/');
  const res = spawnSync(chromePath, [
    '--headless=new',
    `--screenshot=${outputPath}`,
    '--window-size=720,1080',
    '--hide-scrollbars',
    '--allow-file-access-from-files',
    fileUrl
  ]);
  
  if (fs.existsSync(tempHtmlPath)) {
    fs.unlinkSync(tempHtmlPath);
  }
  
  if (fs.existsSync(outputPath)) {
    console.log(`✓ Successfully created ${outputPath} (${fs.statSync(outputPath).size} bytes)`);
  } else {
    console.error(`✗ Failed to create ${outputPath}`, res.stderr?.toString(), res.stdout?.toString());
  }
}
