---
title: What ease means in spaced repetition, explained simply
description: What a card's ease factor is, how each answer button changes it, why cards get stuck in "ease hell", and simple habits that keep your reviews in proportion.
date: 2026-11-18
keywords: anki ease factor explained, ease hell, sm-2 ease factor, spaced repetition ease
---

Ease is the number that decides how fast a card's gaps grow. In SM-2 style schedulers like Anki's classic one and Ankitti's, each card starts with an ease of 2.5, which means that every time you answer **Good**, the next gap is about two and a half times the last one. Cards you find hard get a lower ease, so they come back more often; cards you find easy get a higher one, so they spread out faster.

That's the whole idea. The rest of this post shows what ease looks like in practice, how each button changes it, and why a card can get stuck coming back far too often.

## Ease is a multiplier, not a score

It helps to think of ease as a growth rate rather than a grade. A card's next interval is roughly its current interval multiplied by its ease.

Say a card was last shown 8 days ago and you answer Good:

- With an ease of **2.5**, it comes back in about 20 days.
- With an ease of **1.7**, it comes back in about 14 days.
- With an ease of **1.3**, it comes back in about 10 days.

One review apart, the difference looks small. But because the multiplier is applied again at every review, the gap between a high-ease card and a low-ease card gets wider each time.

The idea comes from Piotr Woźniak's SM-2 algorithm, written for SuperMemo in 1987. In the original, ease was called the "E-Factor", started at 2.5 and could never fall below 1.3. Anki's long-standing scheduler and Ankitti both keep those two numbers, though they use four answer buttons instead of SM-2's six grades. The guide to [the SM-2 algorithm](/sm2-algorithm/) walks through the full set of rules.

## How each button changes ease

Ease mostly changes when you answer a card that's already in review. The one exception is Easy, which also raises ease on a card that is still in its learning steps. Here is what each button does to a review card in Ankitti, which follows the same pattern as Anki's classic settings:

| Button | Change to ease | What happens to the gap |
| --- | --- | --- |
| Again | down by 0.20 | Card goes back to short relearning steps |
| Hard | down by 0.15 | Next gap is about 1.2 times the last one |
| Good | no change | Next gap is the last one times the ease |
| Easy | up by 0.15 | Next gap is longer than Good would give |

Ease never goes below 1.3, however many times you press Again. In Ankitti it also stops rising at 3.5.

Notice what's missing from that table: **Good never raises ease.** The only way for a card's ease to go back up is to press Easy. That one detail explains most of the trouble people run into.

## What a lower ease costs you

Here is how the gaps grow for a card you answer Good every time, starting from a one-day interval, at four different ease values. These are worked out from Ankitti's scheduler, which rounds to whole days and always adds at least one day.

| Ease | Gaps after each Good (days) | Days covered by 8 reviews |
| --- | --- | --- |
| 2.5 | 1, 3, 8, 20, 50, 125, 313, 783 | about 1,300 |
| 2.1 | 1, 2, 4, 8, 17, 36, 76, 160 | about 300 |
| 1.7 | 1, 2, 3, 5, 9, 15, 26, 44 | about 105 |
| 1.3 | 1, 2, 3, 4, 5, 7, 9, 12 | about 43 |

Same eight reviews, very different results. A card at 2.5 is pushed out more than three years. A card stuck at 1.3 is still coming back every week or two after a month and a half.

That's fine for a handful of cards that really are hard. It becomes a problem when it happens to hundreds of them, because those cards keep filling your daily reviews.

## Ease hell, and how cards end up there

"Ease hell" is the name Anki users give to this situation: lots of cards sitting at or near the minimum ease, coming back over and over, even after you've learned them.

It usually happens like this:

1. A card is badly made or genuinely tricky, so you fail it a few times early on. Each Again takes 0.20 off. Two lapses take a card from 2.5 to 2.1; six take it to the floor at 1.3.
2. Later you learn it properly. Now you answer it correctly every time and press Good.
3. Good doesn't raise ease, so the card stays at its low value for good. It keeps coming back far more often than you need.

Pressing Hard on cards you actually knew makes it worse, because each Hard takes another 0.15 off. The earlier post on [why your reviews pile up](/blog/why-anki-reviews-pile-up-and-how-to-get-back-on-track/) covers this habit in more detail.

None of this means your memory is failing. It means the card's ease still reflects how you did weeks ago, not how you do now.

## How to keep ease healthy

You can't change how the scheduler works, but you can change how you answer and what you put on cards.

### Use Hard only when you mean it

Hard is for an answer you got right but with real struggle: you hesitated, or you got there by a long route. If you knew it and just felt slow, press Good. Using Hard as a polite version of Good is one of the most common ways ease drifts down.

### Press Easy when a card really is easy

Because Easy is the only button that raises ease, it matters. If you answer instantly and with no doubt, press Easy. That's an honest rating, and it lets a card that once gave you trouble climb back towards a normal pace. Don't press it on cards you had to think about; that just pushes them out too far and you'll forget them.

### Fix the card, not just the rating

If a card keeps failing, the problem is often the card itself. Common fixes:

- **Split it.** A card asking for three things should usually be three cards.
- **Make the question sharper.** If more than one answer could be right, add a hint so only one is.
- **Add a hook.** A short example, a picture or a memory aid can turn a stubborn fact into an easy one.

A rewritten card can also be a new card. Starting over gives it a fresh ease of 2.5, which is often fairer than carrying the old one.

### Let a few hard cards be hard

Some cards really do need more reviews, and a low ease is the scheduler doing its job. The goal isn't to have every card at 2.5. It's to stop cards you know well from being treated as if you don't.

## A note on newer schedulers

Recent versions of Anki also offer FSRS, a different scheduler that doesn't use ease at all; it tracks a card's difficulty and how well you're likely to remember it. If you use FSRS in Anki, most of the ease advice above doesn't apply in the same way, though the habits of rating honestly and fixing bad cards still help. Ease, as described here, belongs to SM-2 style scheduling.

## If you use Ankitti

Ankitti uses SM-2 style scheduling with the defaults described above: a starting ease of 2.5, a minimum of 1.3, learning steps of 1 and 10 minutes, a one-day graduating interval and a four-day easy interval. The four buttons have keyboard shortcuts (1 to 4), so rating honestly doesn't slow you down. If you want to go over a deck before a test without touching any card's ease or schedule, **Practise anyway** lets you review it at any time without changing anything.

## The takeaway

Ease is how fast a card's gaps grow. Again and Hard lower it, Easy raises it, and Good leaves it alone, so a card that struggled early can stay slow long after you've learned it. Rate honestly, keep Hard for real struggle, use Easy when it's earned, and rewrite cards that keep failing. For the bigger picture of why spacing works at all, the guide to [spaced repetition](/spaced-repetition/) is a good next read.
