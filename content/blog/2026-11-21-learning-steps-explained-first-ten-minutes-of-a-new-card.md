---
title: "Learning steps explained: the first ten minutes of a new card"
description: What learning and relearning steps are, what each button does to a brand-new card, and how to use those first few minutes so new cards really stick.
date: 2026-11-21
keywords: anki learning steps, relearning steps, learning steps explained, new card learning steps
---

Learning steps are the short, minute-sized gaps a new card goes through before it starts getting gaps of days. With the common defaults of 1 minute and 10 minutes, you see a new card, see it again about a minute later, again about ten minutes after that, and then tomorrow. Their job is simple: make sure you can actually recall the card before the schedule starts spacing it out.

Relearning steps are the same idea for cards you forget later on. The rest of this post walks through those first ten minutes button by button, explains why they matter, and shows how to get the most out of them.

## What learning steps are for

A spaced-repetition scheduler works by stretching the gap between reviews each time you remember a card. That only makes sense once the card is in your memory in the first place. A card you have just read for the first time isn't learned yet. You've only seen it.

Learning steps close that gap. They give you a couple of quick, early chances to recall the card while it's still fresh, and they only let it move on once you've got it right. Until then, the card stays in a short loop measured in minutes.

Two things make this a good idea:

- **Most forgetting happens early.** Hermann Ebbinghaus's experiments on the [forgetting curve](https://en.wikipedia.org/wiki/Forgetting_curve), published in 1885, showed that memory drops fastest soon after learning and then levels off. A check a few minutes later catches a new card during the stretch when it fades fastest.
- **Recalling is what builds memory.** The testing effect, shown in well-known experiments by Roediger and Karpicke (2006), is the finding that practising recall beats rereading. Each learning step is a small recall attempt, not a second look.

So the first ten minutes aren't a formality. They turn "I've seen this" into "I can produce this".

## A new card, button by button

Here is what each button does to a brand-new card with learning steps of 1 and 10 minutes, the defaults in Anki-style SM-2 scheduling.

| Button | First time you see it | Second time (the 10-minute step) |
| --- | --- | --- |
| Again | back in 1 minute | back to the start: 1 minute |
| Hard | back in about 6 minutes | repeats the step: 10 minutes |
| Good | moves on: 10 minutes | graduates: back tomorrow |
| Easy | graduates: back in 4 days | graduates: back in 4 days |

A few things are worth noticing.

- **Good is the normal path.** Two Goods in a row take the card from new to "see you tomorrow" in about ten minutes.
- **Again is cheap here.** It just restarts the short loop. It doesn't push the card's long-term schedule back the way a lapse on a review card does.
- **Hard means "nearly, give me a bit less time".** On the first step it lands halfway between 1 and 10 minutes. On the last step it repeats the 10-minute wait.
- **Easy skips everything.** The card leaves learning straight away with a 4-day gap. That's right for something you already knew well before you made the card, and too generous for something you're only just meeting.

After it graduates, the card's gaps grow by its ease, which starts at 2.5. The post on [what ease means](/blog/what-ease-means-in-spaced-repetition-explained-simply/) explains that part, and [the four answer buttons](/blog/should-you-press-hard-or-again-four-answer-buttons/) covers how to choose between them once cards are in review.

## The first ten minutes, in practice

Here is a typical first meeting with a new card, say a Spanish word.

1. **Minute 0.** You see "la ventana" and try to recall it. Nothing comes. You flip, read "the window", and press **Again**.
2. **Minute 1.** It comes back. This time "window" comes to mind before you flip. You press **Good**.
3. **Minute 11.** It comes back once more. You still have it. You press **Good** and the card graduates.
4. **Tomorrow.** It shows up as a normal review, now on its way to longer gaps.

In practice, the card won't reappear at exactly one minute and ten minutes, because you'll be in the middle of other cards. That's fine. The point is a short break, then another honest attempt.

It also explains why a session with new cards feels busier than a review-only session. Each new card asks for two or three looks on its first day instead of one. Ten new cards means roughly twenty to thirty answers before they all graduate.

## Relearning steps: when you forget a review card

Sooner or later you'll press **Again** on a card that already had a gap of days or weeks. That's called a lapse, and the card goes into relearning.

Relearning works like learning, with a few differences.

- **The ease drops.** In SM-2 style scheduling, a lapse takes 0.20 off the card's ease (it never goes below 1.3), so its future gaps grow a little more slowly.
- **The card goes through short steps again.** In Ankitti these are the same 1- and 10-minute steps used for new cards. In Anki, relearning steps are a separate setting, a single 10-minute step by default.
- **It comes back with a short gap.** Once you get it right in relearning, the card returns to normal reviews starting from a one-day gap, then grows from there.

Relearning is the scheduler's way of saying "this one slipped, let's rebuild it before trusting it again". It isn't a punishment. Pressing Again honestly on a forgotten card is what keeps it from vanishing quietly.

If the same card keeps lapsing, the problem is usually the card itself, often because it asks for too much at once. Splitting it into smaller cards tends to help more than relearning it over and over.

## How to get the most out of learning steps

A few habits make those first minutes count.

### Really try before you flip

Give yourself a few seconds to produce the answer, out loud or in your head. Flipping straight away and pressing Good because the answer "looked right" skips the recall that learning steps exist for.

### Be generous with Again on new cards

On a new card, Again costs you about a minute and nothing else. If you're unsure whether you truly knew it, press Again. You'll see it again soon, and a confident Good later is worth more.

### Save Easy for things you already knew

Easy on a brand-new card jumps it to four days. Use it for a word you've known for years or a fact you'd never forget, not for something you've just learned and happened to remember a minute later.

### Keep new cards to a steady, small number

Every new card adds two or three answers to today's session, then a run of reviews over the following weeks. A small number of new cards every day is easier to keep up with than a big batch once a week. The post on [how many flashcards to study a day](/blog/how-many-flashcards-a-day/) has numbers to plan with.

### Don't worry if you stop halfway

If you close the app before a card's 10-minute step, nothing breaks. The card has simply not graduated yet, and it will be waiting for you the next time you study.

## Should you change your learning steps?

Anki lets you change learning and relearning steps in the deck options. Some people add a longer step, such as an hour, for hard material. Others use a single short step for easy decks. The trade-off is simple: more or longer steps give you more practice on day one but make sessions longer, while fewer steps send cards to tomorrow sooner but catch fewer shaky ones.

For most learners, the defaults of 1 and 10 minutes are a sensible place to start. If you change anything, change one thing at a time and give it a couple of weeks before judging it. The guide to [the SM-2 algorithm](/sm2-algorithm/) shows how learning steps fit into the full set of rules.

## If you use Ankitti

Ankitti uses Anki-style SM-2 scheduling with these defaults: learning steps of 1 and 10 minutes, a one-day graduating interval, a four-day easy interval and a starting ease of 2.5. You can press Space to flip a card and 1 to 4 to rate it, which keeps a learning loop quick. If you want to go over a deck again before a test, **Practise anyway** lets you review it without changing any card's schedule. The guide to [spaced repetition](/spaced-repetition/) covers the bigger picture.

## The takeaway

Learning steps are a short check before the long gaps begin: see the card, recall it a minute later, recall it again ten minutes later, then meet it tomorrow. Relearning steps do the same for cards you've forgotten. Try properly before you flip, press Again freely on new cards, keep Easy for things you already knew, and those first ten minutes will give every card a solid start.
