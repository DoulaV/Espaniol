/* All the course content: milestones, phases and their daily blocks, shows, resources. Edit here to change the plan. */
export const MILESTONES=[{h:0,t:'Start'},{h:300,t:'Patient speakers'},{h:600,t:'Normal speed'},{h:1000,t:'Most TV'},{h:1500,t:'Shows and music'}];
export const LINK={
  anki:'https://apps.ankiweb.net/', lt:'https://www.languagetransfer.org/', ds:'https://www.youtube.com/@DreamingSpanish/videos',
  dsSite:'https://www.dreamingspanish.com', lyr:'https://lyricstraining.com/', es:'https://www.youtube.com/@EasySpanish',
  cbs:'https://coffeebreaklanguages.com/coffeebreakspanish/', lr:'https://www.languagereactor.com/', nf:'https://www.netflix.com/', sd:'https://www.spanishdict.com/guide'
};
export const PHASES=[
 {name:'Foundation',from:0,to:150,gate:'Language Transfer is finished and Anki is near 1,000 words.',blocks:[
  {k:'study',t:'Vocabulary',d:10,src:'Anki',how:'Review due cards, then add 10 new words. Say each one out loud.',url:LINK.anki},
  {k:'study',t:'Structure',d:15,src:'Language Transfer',how:'One or two tracks. Pause and answer before the student does.',url:LINK.lt},
  {k:'listen',t:'Listening',d:30,src:'Dreaming Spanish · Superbeginner',how:'Spanish only, no subtitles. Follow the story, not every word.',url:LINK.ds},
  {k:'listen',t:'Music',d:5,src:'LyricsTraining',how:'One song you like, fill-in-the-blanks, beginner mode.',url:LINK.lyr}]},
 {name:'Building',from:150,to:300,gate:'You follow patient speakers on familiar topics.',blocks:[
  {k:'study',t:'Vocabulary',d:10,src:'Anki',how:'Reviews first, then 10 new words.',url:LINK.anki},
  {k:'listen',t:'Listening',d:45,src:'Dreaming Spanish · Beginner',how:'Pick videos where you catch about 70% or more.',url:LINK.ds},
  {k:'listen',t:'Music',d:5,src:'LyricsTraining',how:'Move songs you know up to intermediate mode.',url:LINK.lyr}]},
 {name:'Bridge',from:300,to:600,gate:'You understand normal-speed speech on familiar topics.',blocks:[
  {k:'study',t:'Vocabulary',d:5,src:'Anki',how:'Reviews only. New words now come from what you watch.',url:LINK.anki},
  {k:'listen',t:'Listening',d:40,src:'Dreaming Spanish Intermediate · Easy Spanish',how:'Mix learner videos with real street interviews.',url:LINK.ds},
  {k:'listen',t:'Native show',d:10,src:'Easy native show, Spanish subtitles',how:'Extra en Español or a slow drama. Spanish subtitles only.',url:LINK.nf},
  {k:'listen',t:'Music',d:5,src:'LyricsTraining',how:'Read the lyrics once, then replay without them.',url:LINK.lyr}]},
 {name:'Native',from:600,to:1000,gate:'Easy and medium shows work without subtitles.',blocks:[
  {k:'listen',t:'Native show',d:45,src:'Netflix with Language Reactor',how:'Spanish subtitles, click unknown words, keep going.',url:LINK.lr},
  {k:'listen',t:'Listening',d:10,src:'Dreaming Spanish Advanced or a podcast',how:'Easy listening to keep volume high.',url:LINK.ds},
  {k:'listen',t:'Music',d:5,src:'Songs without lyrics',how:'Try to follow a song before you check the words.',url:LINK.lyr}]},
 {name:'Goal',from:1000,to:1500,gate:'80 to 90% of shows and most music understood.',blocks:[
  {k:'listen',t:'Native show',d:45,src:'Any show, no subtitles',how:'Watch for the story. Rewind only when you are truly lost.',url:LINK.nf},
  {k:'listen',t:'Music',d:15,src:'Songs without lyrics',how:'Full songs, eyes closed. Check lyrics after, never before.',url:LINK.lyr}]}
];
export const SHORT_BLOCK={k:'listen',t:'Short day',d:15,src:'Dreaming Spanish at your level',how:'Fifteen minutes keeps the streak alive. Never miss twice.',url:LINK.ds};
export const SHOWS=[
 {id:'extra',t:'Extra en Español',m:'Learner sitcom · Free on YouTube',u:300},
 {id:'cuervos',t:'Club de Cuervos',m:'Mexico · Comedy · Netflix',u:600},
 {id:'flores',t:'La Casa de las Flores',m:'Mexico · Dark comedy · Netflix',u:600},
 {id:'merli',t:'Merlí',m:'Spain · Drama, slower pace',u:700},
 {id:'granhotel',t:'Gran Hotel',m:'Spain · Period mystery',u:800},
 {id:'papel',t:'La Casa de Papel',m:'Spain · Fast heist thriller · Netflix',u:1000},
 {id:'elite',t:'Élite',m:'Spain · Teen slang · Netflix',u:1000},
 {id:'visavis',t:'Vis a Vis',m:'Spain · Prison drama',u:1000}
];
export const RES={
 resCore:[
  {i:'LT',c:['#ff8a5b','#ff5a3c'],t:'Language Transfer',p:'Complete Spanish audio course. Free, no sign-up.',u:LINK.lt},
  {i:'DS',c:['#62c6ff','#2f7bff'],t:'Dreaming Spanish',p:'Videos from Superbeginner to Advanced. Log your hours on the site.',u:LINK.ds},
  {i:'A',c:['#7ad38a','#16a865'],t:'Anki',p:'Flashcards. Get the Spanish Top 5000 shared deck.',u:LINK.anki},
  {i:'♪',c:['#ff9fc4','#ff5a8a'],t:'LyricsTraining',p:'Music videos with blanked-out lyrics to type.',u:LINK.lyr}],
 resExtra:[
  {i:'CB',c:['#ffd166','#ff9f1c'],t:'Coffee Break Spanish',p:'Beginner podcast for the commute. The podcast is free.',u:LINK.cbs},
  {i:'ES',c:['#9aa7ff','#5b6cff'],t:'Easy Spanish',p:'Street interviews in Spain and Latin America, real speed.',u:LINK.es},
  {i:'DS',c:['#62c6ff','#2f7bff'],t:'Dreaming Spanish website',p:'Hour tracker and level filters.',u:LINK.dsSite}],
 resBridge:[
  {i:'LR',c:['#c39bff','#8a4dff'],t:'Language Reactor',p:'Chrome extension: Spanish subtitles and click-to-translate on Netflix and YouTube.',u:LINK.lr},
  {i:'SD',c:['#6fd6d0','#139a9a'],t:'SpanishDict grammar guide',p:'Look things up when you are curious. Do not study it.',u:LINK.sd}]
};
