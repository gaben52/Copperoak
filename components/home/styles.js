import { OAKFLOW_CSS } from '@/components/design-system';

const HOME_LAYOUT = `
.home-wrap{
  min-height:100vh;
  padding:var(--of-gutter);
  display:flex;
  flex-direction:column;
}
.home-header{
  display:flex;
  align-items:center;
  gap:12px;
  padding-bottom:var(--of-s4);
  margin-bottom:var(--of-s8);
  border-bottom:1px solid var(--of-border);
}
.home-signin{ margin-left:auto;text-decoration:none; }
.home-brand-icon{
  width:36px;height:36px;flex:none;
  border-radius:var(--of-r);
  background:var(--of-oak-soft);
  border:1px solid #e6dccb;
  color:var(--of-oak);
  display:flex;align-items:center;justify-content:center;
  font-size:17px;line-height:1;
}
.home-header h1{
  font-size:19px;font-weight:650;letter-spacing:-.015em;margin:0;color:var(--of-text);
}
.home-header .brand-a{ color:var(--of-text); }
.home-header .brand-b{ color:var(--of-text-3);font-weight:500; }
.home-header .tag{
  font-size:11.5px;font-weight:500;color:var(--of-text-3);
  letter-spacing:.04em;margin-top:1px;
}

.home-intro{ max-width:640px;margin-bottom:var(--of-s7); }
.home-intro h2{
  font-size:26px;font-weight:650;letter-spacing:-.015em;margin:0 0 8px;color:var(--of-text);
}
.home-intro p{ font-size:14px;color:var(--of-text-2);margin:0;line-height:1.6; }

.home-grid{
  display:grid;
  grid-template-columns:repeat(auto-fit,minmax(250px,1fr));
  gap:var(--of-s5);
  /* Wide enough for 4 cards (the admin's "User Management" card included) to sit in one row at
     a comfortable width on a normal desktop screen — 4*250 + 3*gap. Still wraps gracefully via
     auto-fit on narrower windows. */
  max-width:1160px;
}
.home-card{
  display:flex;
  flex-direction:column;
  padding:var(--of-s6);
  text-decoration:none;
  transition:border-color .15s ease,box-shadow .15s ease,transform .15s ease;
}
.home-card:hover{
  border-color:var(--of-oak);
  box-shadow:var(--of-shadow-md);
  transform:translateY(-1px);
}
.home-card:focus-visible{ outline:none; }
.home-card-icon{
  width:38px;height:38px;border-radius:var(--of-r);
  background:var(--of-oak-soft);color:var(--of-oak);
  display:flex;align-items:center;justify-content:center;
  margin-bottom:var(--of-s4);
}
.home-card h3{
  font-size:15px;font-weight:600;letter-spacing:-.005em;margin:0 0 6px;color:var(--of-text);
}
.home-card p{
  font-size:12.5px;color:var(--of-text-3);margin:0 0 var(--of-s5);line-height:1.55;flex:1;
}
.home-card .home-card-cta{
  font-size:12.5px;font-weight:600;color:var(--of-oak);
  display:inline-flex;align-items:center;gap:4px;
}
.home-card:hover .home-card-cta{ gap:7px; }
.home-card .home-card-cta svg{ transition:transform .15s ease; }

@media (max-width:560px){
  .home-intro h2{ font-size:21px; }
}
`;

export function homeCSS() {
  return OAKFLOW_CSS + HOME_LAYOUT;
}
