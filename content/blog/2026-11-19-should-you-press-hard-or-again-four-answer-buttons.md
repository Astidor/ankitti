---
title: Should you press Hard or Again? The four answer buttons
description: When to press Again, Hard, Good or Easy, what each button does to a card's next review, and a simple rule for the moments you can't decide.
date: 2026-11-19
keywords: anki again vs hard, anki good vs easy, flashcard answer buttons, when to press hard anki
---

Press **Again** if you couldn't produce the answer, or got any important part of it wrong. Press **Hard** only if you got it fully right but it took real effort. Most of the time, a correct answer deserves **Good**, and **Easy** is for answers that came instantly with no doubt at all.

The short version of the Hard-or-Again question is this: it's about whether you were right, not how you felt. If you were wrong, it's Again, however close you came. If you were right, it's Hard, Good or Easy, depending on how much work it took. The rest of this post shows what each button actually does, so you can see why that rule matters.

## What the buttons are really asking

After you flip a card, the four buttons ask one question: how well did you remember this? The scheduler uses your answer to decide when to show the card next. If you remembered it well, it waits longer. If you struggled, it comes back sooner.

That means your answer is information, not a grade. Nobody sees it and there's no prize for pressing Good. The only thing an inaccurate answer does is send the card back at the wrong time: too soon, and you waste reviews; too late, and you've forgotten it by the time it returns.

It also helps to remember why you're doing this at all. Trying to recall something, rather than rereading it, is what makes it stick. This is the testing effect, shown in well-known experiments by Roediger and Karpicke (2006). The buttons come after that effort. Rating honestly just makes sure the next attempt happens at a useful time.

## The four buttons at a glance

Here is a quick guide to which button fits which moment.

| What happened | Press |
| --- | --- |
| Blank, or the wrong answer | Again |
| Half right, or one key detail wrong | Again |
| Right, but you had to work hard for it | Hard |
| Right, after a normal moment of thought | Good |
| Right, instantly, with no doubt | Easy |

Two rows surprise people. A half-right answer is **Again**, not Hard, because Hard means "I got it". And an ordinary correct answer with a second or two of thinking is **Good**, not Hard. Pausing to think is what recall feels like.

## What each button does to a new card

New cards go through short learning steps before they start getting gaps of days. In Ankitti, which uses Anki-style SM-2 scheduling, those steps are 1 minute and 10 minutes. Here is what each button does the first time you see a card:

| Button | When you see it next |
| --- | --- |
| Again | in about 1 minute |
| Hard | in about 6 minutes |
| Good | in 10 minutes |
| Easy | in 4 days (it skips the steps) |

On the second step, Good moves the card out of learning and brings it back tomorrow. Hard repeats the 10-minute step, and Again sends it back to the start.

During learning, there's little cost to pressing Again. The card just comes back in a minute, and the learning steps don't change its long-term pace. So if you're unsure whether you really knew a brand-new card, Again is a safe choice.

Easy is the one to be careful with here. It jumps the card straight to a 4-day gap, so only use it on a new card you already know well, such as a word you learned years ago.

## What each button does to a review card

Once a card has graduated, the buttons matter more, because they change both the next gap and the card's ease, the multiplier that controls how fast gaps grow. The post on [what ease means](/blog/what-ease-means-in-spaced-repetition-explained-simply/) covers ease in detail.

Here is a real example from Ankitti's scheduler. A card was last shown 10 days ago and has the starting ease of 2.5:

| Button | Next review | Ease afterwards |
| --- | --- | --- |
| Again | in 1 minute, then relearning | 2.3 |
| Hard | in 12 days | 2.35 |
| Good | in 25 days | 2.5 |
| Easy | in 34 days | 2.65 |

A few things stand out.

- **Again is a reset.** The card goes back to the short relearning steps, and when it graduates again it starts from a one-day gap. Its ease also drops by 0.20.
- **Hard still moves the card forward**, but only by about 1.2 times the last gap, and it takes 0.15 off the ease.
- **Good keeps everything as it is** and multiplies the gap by the ease.
- **Easy raises the ease** and gives a bigger jump than Good.

## Why pressing Hard by habit costs you

Hard looks harmless because the card still moves forward. The problem shows up when you press it on cards you actually knew, again and again.

Take the same card at 10 days and ease 2.5, and answer it correctly three times in a row:

| Habit | Gaps after three reviews (days) | Ease afterwards |
| --- | --- | --- |
| Hard each time | 12, 14, 17 | 2.05 |
| Good each time | 25, 63, 158 | 2.5 |

After three Hards, the card is due again in 17 days. After three Goods, it's due in about five months. The Hard card also leaves with a lower ease, so even if you press Good from now on, it grows more slowly than before.

Multiply that by a few hundred cards and you get a heavy daily load made of cards you already know. The post on [why your reviews pile up](/blog/why-anki-reviews-pile-up-and-how-to-get-back-on-track/) explains how this adds up over weeks.

## Hard or Again: the tricky cases

Most of the time the choice is clear. These are the moments people get stuck on.

### "I got it, but only after a long pause"

If you got there yourself and the answer was right, that's Hard, or Good if the pause was just normal thinking. A useful test: would you have got it in a real exam or conversation, without help? If yes, it's not Again.

### "I got most of it"

If the card asks for one thing and you got it slightly off, such as a wrong accent or a mixed-up number, press Again. If the card asks for several things and you missed one, press Again too, and think about splitting it into smaller cards. A card that's often half right is usually a card that's doing too much.

### "I knew it the moment I saw the answer"

Recognising an answer isn't the same as recalling it. If you couldn't produce it before you flipped the card, press Again, even if it felt obvious afterwards.

### "I guessed, and the guess was right"

If it was a lucky guess, treat it as Again. If you had a real sense of the answer but weren't sure, Hard is fair.

### "I can't decide"

When you're torn between Hard and Good on a correct answer, pick Good. When you're torn between Hard and Again because you're not sure you were right, pick Again. Either way, decide in a second or two and move on. Agonising over a button costs more time than a slightly imperfect rating.

## Do you need all four buttons?

Some people only use Again and Good, treating every review as a simple pass or fail. It's quick and removes the hesitation, which is a fair reason to try it.

With SM-2 style scheduling, though, it has a side effect. Again lowers a card's ease, and only Easy raises it. If you never press Easy, every card's ease can only stay the same or go down over time. Pressing Easy now and then on cards that truly are effortless keeps those cards moving out at a sensible pace. The guide to [the SM-2 algorithm](/sm2-algorithm/) shows the full rules if you want to see why.

Recent versions of Anki also offer FSRS, a different scheduler that doesn't use ease in the same way. If that's what you use, the Anki manual's page on [studying and the answer buttons](https://docs.ankiweb.net/manual/studying) describes how its buttons behave.

## If you use Ankitti

Ankitti has the same four buttons with Anki-style SM-2 scheduling: learning steps of 1 and 10 minutes, a one-day graduating interval, a four-day easy interval and a starting ease of 2.5. You can press Space to flip a card and 1 to 4 to rate it, so choosing a button takes no longer than a key press. If you want to go over a deck before a test without affecting any card's schedule, **Practise anyway** lets you review it as often as you like without changing anything.

## The takeaway

Wrong or half right is Again. Right with real struggle is Hard. Right after normal thought is Good. Right instantly is Easy. Keep Hard for genuine effort, don't fear Again during learning, and when in doubt about a correct answer, press Good. Honest, quick ratings are what let spaced repetition put each card in front of you at the right time.
