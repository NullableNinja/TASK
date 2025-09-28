// ======================
// schedule.js
// Handles schedule table rendering
// ======================

const kids = [
  { group:"White Gold", Mon:"", Tue:"6:00 pm", Wed:"", Thu:"5:00 pm", Fri:"", Sat:"11:30 am" },
  { group:"Orange", Mon:"4:00 pm", Tue:"", Wed:"", Thu:"6:00 pm", Fri:"", Sat:"11:30 am" },
  { group:"Green", Mon:"", Tue:"5:00 pm", Wed:"", Thu:"4:00 pm", Fri:"", Sat:"10:30 am" },
  { group:"Purple", Mon:"", Tue:"5:00 pm", Wed:"", Thu:"4:00 pm", Fri:"", Sat:"10:30 am" },
  { group:"Blue", Mon:"", Tue:"5:00 pm", Wed:"4:00 pm", Thu:"", Fri:"", Sat:"10:30 am" },
  { group:"Red", Mon:"", Tue:"5:00 pm", Wed:"4:00 pm", Thu:"", Fri:"", Sat:"10:30 am" },
  { group:"Brown", Mon:"5:00 pm*", Tue:"5:00 pm", Wed:"4:00 pm", Thu:"", Fri:"", Sat:"10:30 am" },
  { group:"Black", Mon:"6:00 pm*", Tue:"5:00 pm", Wed:"", Thu:"", Fri:"", Sat:"10:30 am" },
  { group:"Sparring", Mon:"", Tue:"4:00 pm", Wed:"", Thu:"", Fri:"", Sat:"" },
  { group:"Weapons", Mon:"", Tue:"", Wed:"6:00 pm*", Thu:"", Fri:"", Sat:"" },
  { group:"Mat Class", Mon:"", Tue:"", Wed:"", Thu:"", Fri:"5:00 pm", Sat:"" }
];

const adults = [
  { group:"White • Gold • Orange", Mon:"", Tue:"9:30 am* / 7:00 pm*", Wed:"", Thu:"9:30 am* / 7:00 pm*", Fri:"6:00 pm*", Sat:"9:00 am" },
  { group:"Green Belt & up", Mon:"", Tue:"9:30 am* / 7:00 pm*", Wed:"", Thu:"9:30 am* / 7:00 pm*", Fri:"6:00 pm*", Sat:"9:00 am" },
  { group:"Brown", Mon:"5:00 pm*", Tue:"9:30 am* / 7:00 pm*", Wed:"", Thu:"9:30 am* / 7:00 pm*", Fri:"6:00 pm*", Sat:"9:00 am" },
  { group:"Black", Mon:"6:00 pm*", Tue:"9:30 am* / 7:00 pm*", Wed:"9:30 am* / 7:00 pm*", Thu:"9:30 am* / 7:00 pm*", Fri:"6:00 pm*", Sat:"9:00 am" },
  { group:"Mat Class (mixed)", Mon:"", Tue:"", Wed:"", Thu:"", Fri:"", Sat:"5:00 pm" },
  { group:"Sparring", Mon:"", Tue:"", Wed:"", Thu:"", Fri:"", Sat:"9:45 am" },
  { group:"Weapons (Green & up)", Mon:"", Tue:"7:00 pm*", Wed:"", Thu:"", Fri:"", Sat:"" }
];

function renderRows(data){
  const days = ["Mon","Tue","Wed","Thu","Fri","Sat"];
  return data.map(row => `
    <tr>
      <td>${row.group}</td>
      ${days.map(d => `<td>${row[d]||""}</td>`).join("")}
    </tr>`).join("");
}

// Inject rows
document.getElementById('kidsBody').innerHTML  = renderRows(kids);
document.getElementById('adultBody').innerHTML = renderRows(adults);

// Pillify times
(function pillifyTimes(){
  const timeOnly = /^\s*\d{1,2}:\d{2}\s*(?:am|pm)\*?\s*$/i;
  document.querySelectorAll('.table-scroller table tbody td:not(:first-child)').forEach(td=>{
    const raw = (td.textContent||"").trim();
    if(!raw){ td.textContent=""; return; }

    // multiple times
    if(/[\/,]/.test(raw)){
      const wrap = document.createElement('div');
      wrap.className = 'tstack';
      raw.split(/[\/,]/).map(s=>s.trim()).filter(Boolean).forEach(p=>{
        const span = document.createElement('span');
        span.className = 'time';
        span.textContent = p;
        wrap.appendChild(span);
      });
      td.textContent = ''; td.appendChild(wrap);
      return;
    }

    // single time
    if(timeOnly.test(raw)){
      td.textContent = '';
      const span = document.createElement('span');
      span.className = 'time';
      span.textContent = raw;
      td.appendChild(span);
    }
  });
})();
