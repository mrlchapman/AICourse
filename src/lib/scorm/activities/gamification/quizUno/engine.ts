/**
 * Quiz Uno Game Engine
 * Pure game logic separated from rendering
 * This can be used with any theme/style
 */

import { GamificationActivity, safeJsonEmbed } from '../core/types';

/** Configuration for Quiz Uno game */
export interface QuizUnoConfig {
  questions: QuizUnoQuestion[];
  startingCards: number;
  botDifficulty: 'easy' | 'medium' | 'hard';
  passMarkPercent: number;
  required: boolean;
}

/** A question in the Quiz Uno game */
export interface QuizUnoQuestion {
  id?: string;
  question: string;
  explanation?: string;
  answers: string[];
  correctIndex: number;
}

/**
 * Extracts game configuration from activity
 */
export function extractConfig(activity: GamificationActivity): QuizUnoConfig {
  return {
    questions: activity.config?.unoQuestions || [],
    startingCards: activity.config?.startingCards || 7,
    botDifficulty: activity.config?.botDifficulty || 'medium',
    passMarkPercent: activity.config?.passMarkPercent || 75,
    required: activity.config?.required || false,
  };
}

/**
 * Generates the client-side game script
 * This is the JavaScript that runs in the browser
 */
export function generateGameScript(
  gameId: string,
  uniqueId: string,
  config: QuizUnoConfig,
  classPrefix: string
): string {
  const questionsJson = safeJsonEmbed(config.questions);

  return `
    <script type="application/json" id="questions-data-${gameId}">${questionsJson}</script>

    <script>
    (function() {
        const gameId = '${gameId}';
        const uniqueId = '${uniqueId}';
        const isRequired = ${config.required};
        const STARTING_CARDS = ${config.startingCards};
        const BOT_DIFF = '${config.botDifficulty}';
        const PASS_PERCENT = ${config.passMarkPercent};
        const questionsEl = document.getElementById('questions-data-' + gameId);
        const rawQ = questionsEl ? JSON.parse(questionsEl.textContent || '[]') : [];
        const colors = ['red','blue','green','yellow'];
        const values = ['0','1','2','3','4','5','6','7','8','9','\\u2298','\\u21c4','+2'];
        let deck=[], discard=[], playerHand=[], botHand=[];
        let currentColor='', currentType='';
        let isPlayerTurn=true, pending=null, history=[], qIdx=0, animating=false;
        let isFullscreen = false;

        // Fullscreen functions - use CSS fullscreen for reliability in iframes
        window['toggleCarteFullscreen_' + uniqueId] = function() {
            const container = document.getElementById('${classPrefix}-' + gameId);
            const activity = document.getElementById('activity-' + gameId);
            if (!container || !activity) return;
            if (!isFullscreen) {
                enableCssFullscreen();
            } else {
                disableCssFullscreen();
            }
        };

        function enableCssFullscreen() {
            const container = document.getElementById('${classPrefix}-' + gameId);
            const activity = document.getElementById('activity-' + gameId);
            if (!container || !activity) return;
            container.classList.add('${classPrefix}-maximized');
            activity.classList.add('${classPrefix}-activity-maximized');
            document.body.style.overflow = 'hidden';
            isFullscreen = true;
            updateFullscreenButton();
        }

        function disableCssFullscreen() {
            const container = document.getElementById('${classPrefix}-' + gameId);
            const activity = document.getElementById('activity-' + gameId);
            if (!container || !activity) return;
            container.classList.remove('${classPrefix}-maximized');
            activity.classList.remove('${classPrefix}-activity-maximized');
            document.body.style.overflow = '';
            isFullscreen = false;
            updateFullscreenButton();
        }

        function updateFullscreenButton() {
            const expandIcon = document.getElementById('fs-expand-' + gameId);
            const collapseIcon = document.getElementById('fs-collapse-' + gameId);
            if (expandIcon && collapseIcon) {
                expandIcon.style.display = isFullscreen ? 'none' : 'block';
                collapseIcon.style.display = isFullscreen ? 'block' : 'none';
            }
        }

        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && isFullscreen) {
                disableCssFullscreen();
            }
        });

        function shuffle(a){for(let i=a.length-1;i>0;i--){let j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
        function createDeck(){deck=[];colors.forEach(c=>{values.forEach(v=>{deck.push({color:c,value:v});if(v!=='0')deck.push({color:c,value:v});});});for(let i=0;i<4;i++){deck.push({color:'wild',value:'W'});deck.push({color:'wild',value:'+4'});}shuffle(deck);}
        function draw(){if(deck.length===0){if(discard.length>1){let top=discard.pop();deck=discard;discard=[top];shuffle(deck);}else return null;}return deck.pop();}
        function deal(){for(let i=0;i<STARTING_CARDS;i++){playerHand.push(draw());botHand.push(draw());}let s=draw();while(s.color==='wild'){deck.push(s);shuffle(deck);s=draw();}discard.push(s);currentColor=s.color;currentType=s.value;}
        function getQ(){if(rawQ.length===0)return{question:'No questions configured',explanation:'Add questions in editor.',answers:['Continue'],correctIndex:0};let q=rawQ[qIdx%rawQ.length];qIdx++;return q;}

        function flash(color){const f=document.getElementById('flash-'+gameId);f.style.background=color;f.classList.add('active');setTimeout(()=>f.classList.remove('active'),400);}

        function renderUI(){
            const pa=document.getElementById('player-area-'+gameId),ba=document.getElementById('bot-area-'+gameId);
            pa.className='${classPrefix}-player-area ${classPrefix}-you'+(isPlayerTurn?' active-turn':'');
            ba.className='${classPrefix}-player-area ${classPrefix}-opponent'+(!isPlayerTurn?' active-turn':'');
            const dp=document.getElementById('discard-'+gameId),top=discard[discard.length-1];
            dp.className='${classPrefix}-card ${classPrefix}-discard '+(top.color==='wild'?currentColor:top.color);
            dp.innerHTML='<span class="${classPrefix}-card-corner ${classPrefix}-card-tl">'+top.value+'</span><span class="${classPrefix}-card-value">'+top.value+'</span><span class="${classPrefix}-card-corner ${classPrefix}-card-br">'+top.value+'</span>';
            const bh=document.getElementById('bot-hand-'+gameId);bh.innerHTML='';
            botHand.forEach(()=>{let d=document.createElement('div');d.className='${classPrefix}-card ${classPrefix}-back';d.innerHTML='<span class="${classPrefix}-back-pattern">\\u25c6</span>';bh.appendChild(d);});
            document.getElementById('bot-count-'+gameId).innerText=botHand.length;
            const ph=document.getElementById('player-hand-'+gameId);ph.innerHTML='';
            playerHand.forEach((c,i)=>{
                let el=document.createElement('div');
                el.className='${classPrefix}-card '+c.color;
                el.innerHTML='<span class="${classPrefix}-card-corner ${classPrefix}-card-tl">'+c.value+'</span><span class="${classPrefix}-card-value">'+c.value+'</span><span class="${classPrefix}-card-corner ${classPrefix}-card-br">'+c.value+'</span>';
                el.onclick=()=>playCard(i);
                ph.appendChild(el);
            });
        }

        function shouldTriggerQuiz(card){
            if(card.value==='+2'||card.value==='+4')return'ATK';
            if(card.color==='wild')return'WILD';
            if(Math.random()<0.3)return'BONUS';
            return null;
        }

        function playCard(idx){
            if(!isPlayerTurn)return;
            const card=playerHand[idx];
            const valid=(card.color==='wild'||card.color===currentColor||card.value===currentType);
            if(!valid){flash('rgba(139,0,0,0.5)');return;}
            const qType=shouldTriggerQuiz(card);
            if(qType){
                pending={type:qType,card:card,idx:idx};
                if(qType==='ATK')showQuiz('ATK','\\u2694 ATTACK','Strike against the House!');
                else if(qType==='WILD')showQuiz('WILD','\\u25c6 WILD CARD','Command the table!');
                else if(qType==='BONUS')showQuiz('BONUS','\\u2605 BONUS','Answer for glory!');
                return;
            }
            doPlay('player',idx,card);
        }

        function showQuiz(type,title,subtitle){
            const q=getQ();pending.qData=q;
            const badge=document.getElementById('quiz-badge-'+gameId);
            const modal=document.getElementById('quiz-modal-'+gameId);
            modal.className='${classPrefix}-modal';
            if(type==='ATK'){badge.innerText='\\u2694 ATTACK';badge.className='${classPrefix}-quiz-badge attack';modal.classList.add('attack-mode');}
            else if(type==='DEF'){badge.innerText='\\u26ca DEFEND';badge.className='${classPrefix}-quiz-badge defend';modal.classList.add('defend-mode');flash('rgba(139,0,0,0.4)');}
            else if(type==='WILD'){badge.innerText='\\u25c6 WILD';badge.className='${classPrefix}-quiz-badge wild';modal.classList.add('wild-mode');}
            else{badge.innerText='\\u2605 BONUS';badge.className='${classPrefix}-quiz-badge bonus';modal.classList.add('bonus-mode');}
            document.getElementById('quiz-title-'+gameId).innerText=title;
            document.getElementById('quiz-question-'+gameId).innerText=subtitle+'\\n\\n'+q.question;
            const opts=document.getElementById('quiz-options-'+gameId);opts.innerHTML='';
            q.answers.forEach((ans,i)=>{
                let btn=document.createElement('button');
                btn.className='${classPrefix}-option-btn';
                btn.innerHTML='<span class="${classPrefix}-option-letter">'+'ABCD'[i]+'</span><span class="${classPrefix}-option-text">'+ans+'</span>';
                btn.onclick=()=>handleAnswer(i);
                opts.appendChild(btn);
            });
            document.getElementById('quiz-feedback-'+gameId).style.display='none';
            opts.style.display='block';
            modal.classList.add('active');
        }

        function handleAnswer(idx){
            const correct=(idx===pending.qData.correctIndex);pending.correct=correct;
            history.push({q:pending.qData.question,exp:pending.qData.explanation||'',correct:correct,type:pending.type});
            document.getElementById('quiz-options-'+gameId).style.display='none';
            const fb=document.getElementById('quiz-feedback-'+gameId);fb.style.display='flex';
            fb.className='${classPrefix}-feedback '+(correct?'correct':'wrong');
            const icon=document.getElementById('feedback-icon-'+gameId);
            icon.innerText=correct?'\\u2713':'\\u2717';
            icon.className='${classPrefix}-feedback-icon '+(correct?'correct':'wrong');
            flash(correct?'rgba(212,175,55,0.4)':'rgba(139,0,0,0.4)');
            let msg='';const t=pending.type;
            if(t==='ATK')msg=correct?'CRITICAL HIT! The House draws cards.':'BACKFIRE! You draw 2 cards.';
            else if(t==='DEF')msg=correct?'BLOCKED! Attack nullified.':'FAILED! You draw cards.';
            else if(t==='WILD')msg=correct?'MAGNIFICENT! Choose your color.':'UNFORTUNATE! Random color assigned.';
            else msg=correct?'EXCELLENT! Bonus earned.':'No bonus this round.';
            document.getElementById('feedback-msg-'+gameId).innerText=msg;
            const expEl=document.getElementById('feedback-exp-'+gameId);
            if(pending.qData.explanation){expEl.innerText=pending.qData.explanation;expEl.style.display='block';}else{expEl.style.display='none';}
        }

        window['closeUnoQuiz_'+uniqueId]=function(){document.getElementById('quiz-modal-'+gameId).classList.remove('active');document.getElementById('quiz-modal-'+gameId).className='${classPrefix}-modal';resolveAction();};

        function resolveAction(){
            const t=pending.type,ok=pending.correct,card=pending.card,idx=pending.idx;
            if(t==='ATK'){
                if(ok){let n=card.value==='+4'?4:2;for(let i=0;i<n;i++){let c=draw();if(c)botHand.push(c);}}
                else{for(let i=0;i<2;i++){let c=draw();if(c)playerHand.push(c);}}
                playerHand.splice(idx,1);discard.push(card);currentType=card.value;
                if(card.color==='wild'&&ok){renderUI();document.getElementById('color-modal-'+gameId).classList.add('active');return;}
                else if(card.color==='wild')currentColor=colors[Math.floor(Math.random()*4)];
                else currentColor=card.color;
                renderUI();if(playerHand.length===0)return endGame(true);passTurn(true);
            }else if(t==='DEF'){
                if(ok){isPlayerTurn=true;if(card.color==='wild')currentColor=colors[Math.floor(Math.random()*4)];renderUI();}
                else{let n=card.value==='+4'?4:2;for(let i=0;i<n;i++){let c=draw();if(c)playerHand.push(c);}if(card.color==='wild')currentColor=colors[Math.floor(Math.random()*4)];renderUI();passTurn(false);}
            }else if(t==='WILD'){
                playerHand.splice(idx,1);discard.push(card);currentType=card.value;
                if(ok){renderUI();document.getElementById('color-modal-'+gameId).classList.add('active');}
                else{currentColor=colors[Math.floor(Math.random()*4)];renderUI();if(playerHand.length===0)return endGame(true);passTurn(true);}
            }else if(t==='BONUS'){
                doPlay('player',idx,card);
            }
        }

        window['pickUnoColor_'+uniqueId]=function(c){currentColor=c;document.getElementById('color-modal-'+gameId).classList.remove('active');renderUI();if(playerHand.length===0)return endGame(true);passTurn(true);};

        function doPlay(who,idx,card,cb){
            if(who==='player')playerHand.splice(idx,1);else botHand.splice(idx,1);
            discard.push(card);currentType=card.value;if(card.color!=='wild')currentColor=card.color;
            renderUI();
            if(cb){cb();return;}
            if(playerHand.length===0)return endGame(true);if(botHand.length===0)return endGame(false);
            const skip=(card.value==='\\u2298'||card.value==='\\u21c4');
            if(skip&&who==='player'){isPlayerTurn=true;renderUI();}
            else if(skip&&who==='bot')setTimeout(botTurn,600);
            else passTurn(who==='player');
        }

        function doDraw(who){
            const card=draw();
            if(!card)return null;
            if(who==='player')playerHand.push(card);else botHand.push(card);
            return card;
        }

        function passTurn(playerWent){isPlayerTurn=!playerWent;renderUI();if(!isPlayerTurn)setTimeout(botTurn,800);}

        function botTurn(){
            let matches=botHand.filter(c=>c.color==='wild'||c.color===currentColor||c.value===currentType);
            if(BOT_DIFF==='easy')shuffle(matches);
            else if(BOT_DIFF==='hard'){matches.sort((a,b)=>{if(a.value==='+4')return -1;if(b.value==='+4')return 1;if(a.value==='+2')return -1;if(b.value==='+2')return 1;return 0;});}
            if(matches.length>0){
                const card=matches[0],idx=botHand.indexOf(card);
                if(card.value==='+2'||card.value==='+4'){
                    doPlay('bot',idx,card,()=>{
                        pending={type:'DEF',card:card};
                        setTimeout(()=>showQuiz('DEF','\\u26ca DEFEND','The House played '+card.value+'!'),300);
                    });return;
                }
                if(card.color==='wild')currentColor=colors[Math.floor(Math.random()*4)];
                doPlay('bot',idx,card);
            }else{
                doDraw('bot');renderUI();passTurn(false);
            }
        }

        function endGame(won){
            const answeredCount = history.length;
            const correctCount = history.filter(h=>h.correct).length;
            const percentage = answeredCount > 0 ? (correctCount / answeredCount) * 100 : (won ? 100 : 0);
            const passed = percentage >= PASS_PERCENT;

            const titleEl = document.getElementById('end-title-'+gameId);
            const emblemEl = document.getElementById('end-emblem-'+gameId);

            let statusText = '';
            let emblemClass = '';

            if (passed) {
                statusText = won ? 'VICTORY & PASSED' : 'PASSED';
                emblemClass = 'victory';
                emblemEl.innerText = '\\u265b';
            } else {
                statusText = won ? 'VICTORY \\u00b7 NOT PASSED' : 'DEFEAT';
                emblemClass = won ? 'partial' : 'defeat';
                emblemEl.innerText = won ? '\\u25c7' : '\\u2717';
            }

            titleEl.innerText = statusText;
            emblemEl.className = '${classPrefix}-end-emblem ' + emblemClass;

            const displayPercent = Math.round(percentage * 10) / 10;

            let passInfo = passed
                ? '<span class="${classPrefix}-pass-info passed">\\u2713 Passed (' + displayPercent + '% \\u00b7 need ' + PASS_PERCENT + '%)</span>'
                : '<span class="${classPrefix}-pass-info failed">\\u2717 Failed (' + displayPercent + '% \\u00b7 need ' + PASS_PERCENT + '%)</span>';

            document.getElementById('end-score-'+gameId).innerHTML = 'Questions: ' + correctCount + ' / ' + answeredCount + passInfo;

            let html='';history.forEach((h,i)=>{
                const typeIcon=h.type==='ATK'?'\\u2694':h.type==='DEF'?'\\u26ca':h.type==='WILD'?'\\u25c6':'\\u2605';
                html+='<div class="${classPrefix}-log-item '+(h.correct?'correct':'wrong')+'"><div class="${classPrefix}-log-type">'+typeIcon+'</div><div class="${classPrefix}-log-content"><div class="${classPrefix}-log-question">'+h.q+'</div>';
                if(h.exp)html+='<div class="${classPrefix}-log-exp">'+h.exp+'</div>';
                html+='</div><div class="${classPrefix}-log-result">'+(h.correct?'\\u2713':'\\u2717')+'</div></div>';
            });
            if(history.length===0)html='<p class="${classPrefix}-no-questions">No questions answered</p>';
            document.getElementById('log-'+gameId).innerHTML=html;
            document.getElementById('board-'+gameId).style.display='none';
            document.getElementById('end-'+gameId).classList.add('active');

            if (passed && window.completeGamificationActivity) {
                window.completeGamificationActivity(gameId);
            } else if (passed && isRequired && window.markActivityComplete) {
                window.markActivityComplete(gameId);
            }
        }

        function init(){deck=[];discard=[];playerHand=[];botHand=[];currentColor='';currentType='';isPlayerTurn=true;pending=null;history=[];qIdx=0;createDeck();deal();renderUI();}

        window['startUnoGame_'+uniqueId]=function(){
            document.getElementById('start-'+gameId).classList.remove('active');
            document.getElementById('end-'+gameId).classList.remove('active');
            document.getElementById('board-'+gameId).style.display='flex';
            init();
        };

        document.getElementById('deck-'+gameId).onclick=function(){
            if(!isPlayerTurn)return;
            doDraw('player');renderUI();passTurn(true);
        };
    })();
    </script>
  `;
}
