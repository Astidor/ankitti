---
title: What to do when you keep forgetting the same card
description: Why some flashcards never stick, how to tell what is wrong with a leech card, and five practical fixes that work better than reviewing it again and again.
date: 2026-11-22
keywords: leech flashcards, anki leeches, keep forgetting cards, anki leech fix
---

If you keep forgetting the same card, stop reviewing it as it is and change the card instead. A card that fails again and again is almost always asking too much, asking it in a confusing way, or clashing with a similar card. Rewrite it, split it, add a memory hook, or put it aside for a while. More repetitions of the same broken card rarely fix it.

Cards like this are called leeches, because they drain your time without giving much back. The rest of this post explains how to spot them, how to work out what is wrong, and what to do about each kind.

## What a leech is

A leech is a card you keep forgetting after it has already been learned. Each time you press **Again** on a card that was in review, that's called a lapse. One or two lapses are normal. Everyone forgets things, and the scheduler is built for it. A card that lapses over and over is different. It keeps coming back, eats a few minutes of every week, and still doesn't stick.

Anki tracks this for you. According to the [Anki manual's page on leeches](https://docs.ankiweb.net/manual/leeches), when a card reaches 8 lapses, Anki tags the note as a leech and suspends the card by default. If you keep failing it after that, it warns you again every 4 lapses. Both the threshold and whether to suspend can be changed in the deck options.

Whatever app you use, the rule of thumb is the same: if you've forgotten a card more times than you can count on one hand, the card needs attention, not more reviews.

## Why leeches cost so much

A leech costs more than its own reviews. In SM-2 style scheduling, each lapse sends the card back through short relearning steps and restarts it from a gap of about a day. It also takes 0.20 off the card's ease, with a floor of 1.3. The post on [what ease means](/blog/what-ease-means-in-spaced-repetition-explained-simply/) explains why that matters.

Here is what that looks like for a card that starts with the default ease of 2.5:

| Lapses so far | Ease afterwards |
| --- | --- |
| 0 | 2.5 |
| 2 | 2.1 |
| 4 | 1.7 |
| 6 | 1.3 (the minimum) |

At an ease of 1.3, the gap only grows by about a third each time you get it right. So a leech is due often, it restarts from a day every time you forget it, and it grows slowly even when you remember it. A handful of these in a deck can make your reviews feel heavier than they should. The post on [why reviews pile up](/blog/why-anki-reviews-pile-up-and-how-to-get-back-on-track/) covers the wider picture.

There's a quieter cost too. Failing the same card again and again is discouraging, and it's a common reason people start to dread a deck.

## Work out why the card isn't sticking

Before you fix a leech, take ten seconds to ask what's wrong with it. Most leeches fall into one of these groups.

### It asks for too much

"List the causes of the First World War" or "What are the side effects of this drug?" asks for several things at once. You might get four out of five every time, and still have to press Again. The answer is a pile of facts, not one.

### You don't really understand it

Some cards ask you to memorise something you never quite made sense of: a formula you can't explain, a grammar rule you've only seen once, a term from a chapter you skimmed. Memory holds on to things that connect to what you already know. A string of words with no meaning has nothing to hold on to.

### It clashes with another card

Two similar cards can get in each other's way. Psychologists call this interference. The Anki manual gives the example of "disappoint" and "disappear". Language learners meet it all the time: two words that look alike, two kanji with one stroke of difference, two drugs with similar names. You know both answers, but not which belongs to which.

### The question is vague

If the front of the card could fairly have more than one answer, you'll often "fail" by giving a right answer that isn't the one written on the back. "What is the capital?" with no country, or a word with three common translations, are typical.

### It doesn't matter to you

Sometimes a card is hard to remember because you don't care about it. It came from a shared deck, or a lecture slide you'll never be tested on. That's a fair reason to let it go.

## Five ways to fix a leech

Once you know why a card is failing, the fix is usually clear.

### 1. Split it into smaller cards

If the card asks for a list or several details, turn it into several cards that each ask for one thing. "What are the three main symptoms of X?" becomes three cards, each giving one clue and asking for one symptom, or one card per symptom with the disease on the front. For lists you really do need in order, a set of cloze cards on the same sentence works well, one gap per card.

Smaller cards are quicker to review, easier to rate honestly and far less likely to turn into leeches.

### 2. Go back and understand it

If you don't understand a card, more reviews won't help. Close the app for a moment and look it up again in your notes, textbook or a good reference. Once it makes sense, rewrite the card in your own words. Often the old card can be replaced by one or two simpler ones that ask "why" or "what happens if", which give the fact something to connect to.

### 3. Add a memory hook

For facts that are simply arbitrary, like a date, a spelling or a word in another language, a hook helps. That could be a mnemonic, a silly image, a link to a word you already know, or a short example sentence. Put the hook on the back of the card so you see it every time you check your answer. If a picture helps you, add one: an image is often easier to remember than a definition.

### 4. Make similar cards different

For two cards that clash, make the difference the point of the card. Add a short note on each that names the other: "not to be confused with…" and the one detail that separates them. You can also add a card that asks directly about the difference, such as "Which one means to vanish: disappoint or disappear?"

The Anki manual also suggests learning one of the pair first and leaving the other suspended until the first one is solid. That's slower, but it works well for stubborn pairs.

### 5. Delete it or put it aside

If the card isn't worth the effort, delete it. There's no rule that says you must keep every card you made or downloaded. Dropping a few cards you don't care about leaves more time for the ones you do. If you think you'll want it later, suspend it instead and come back to it when you have more context.

## Habits that prevent leeches

A few habits stop most leeches from forming in the first place.

- **One fact per card.** If you can't answer a card in a word or a short phrase, think about splitting it before you add it.
- **Understand first, then make cards.** Make cards after you've read and made sense of a topic, not while skimming it.
- **Make the front specific.** A good question has one right answer. Add context, like the subject or a clue, whenever an answer could be ambiguous.
- **Rate honestly.** Pressing Good on a card you half knew hides the problem until it's a leech. The post on [the four answer buttons](/blog/should-you-press-hard-or-again-four-answer-buttons/) has a simple rule for this.
- **Fix cards early.** When a card fails for the second or third time, take a moment to look at it. It's much easier to fix a card after three lapses than after ten.

## If you use Ankitti

Ankitti uses Anki-style SM-2 scheduling, so a forgotten card goes back through 1- and 10-minute relearning steps and its ease drops, never below 1.3. When you rewrite a leech, you can turn a list into cloze cards with `{{c1::…}}`, add a picture to the back, and your draft is saved as you type. If you want to drill a tricky card before a test, **Practise anyway** lets you review a deck as often as you like without changing any card's schedule. The guide to [spaced repetition](/spaced-repetition/) explains how the rest of the schedule works.

## The takeaway

A card you keep forgetting is telling you something about the card, not about you. Ask why it's failing: too much at once, not understood, clashing with another card, vague, or simply not important. Then split it, understand it, give it a hook, make it distinct, or let it go. Fixing one leech today saves you many frustrating reviews over the months ahead.
