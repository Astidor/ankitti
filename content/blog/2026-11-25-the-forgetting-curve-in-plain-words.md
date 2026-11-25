---
title: The forgetting curve in plain words
description: What Ebbinghaus's forgetting curve really shows, what it doesn't, what changes how fast you forget, and how to use it to plan your flashcard reviews.
date: 2026-11-25
keywords: ebbinghaus forgetting curve, forgetting curve explained, how fast we forget, forgetting curve spaced repetition
---

The forgetting curve is a simple picture of how memory fades: you lose new information quickly at first, and then more and more slowly. It comes from experiments Hermann Ebbinghaus published in 1885. The useful part for learners is the second half of the story: every time you successfully recall something, the curve gets flatter, so the next bout of forgetting takes longer.

This post explains what Ebbinghaus actually did, what the curve does and doesn't tell you, what changes how fast you forget, and how to turn all of that into a study routine.

## What Ebbinghaus actually did

Ebbinghaus was a German psychologist who wanted to measure memory in a careful, repeatable way. He used himself as the only subject and kept his methods very strict.

To keep meaning out of the way, he memorised lists of nonsense syllables: short made-up strings of a consonant, a vowel and a consonant that weren't real words. Real words come with associations and stories, and he wanted to see how memory behaved without that help.

He learned a list until he could recite it without mistakes, waited a set amount of time, from minutes up to about a month, and then learned it again. Instead of asking "how much can I still recall?", he measured how much less time relearning took. He called this the savings. If relearning took half as long as the first time, half of the effort had been saved.

Plot the savings against the delay and you get the forgetting curve: a steep drop soon after learning, then a long, slow tail. You can see the classic shape on the [forgetting curve](https://en.wikipedia.org/wiki/Forgetting_curve) page on Wikipedia.

## What the curve tells you, and what it doesn't

The shape of the curve has held up well. Fast early forgetting followed by slower forgetting is something you'll notice in your own studying within a week.

The exact numbers are a different matter. You'll often see claims online that people forget a fixed percentage of everything within an hour or a day. Be careful with those. Ebbinghaus was one person learning meaningless syllables under strict conditions, and how fast you forget depends heavily on what you're learning and how well you learned it. A word you met once in a list fades very differently from a concept you understood and used.

So treat the curve as a shape, not a timetable. It tells you *when* forgetting is fastest, which is the part you can act on.

### Forgotten isn't the same as gone

The savings method hides a hopeful finding. Even when Ebbinghaus couldn't recite a list any more, relearning it was faster than learning it from scratch. Something was still there.

You'll see the same thing with flashcards. A card you've forgotten usually comes back faster the second time. That's why pressing **Again** isn't a failure. It's a cheap repair on a memory that hasn't fully gone.

## What changes how fast you forget

The curve isn't fixed. Several things you control make it steeper or flatter.

### How well you learned it the first time

Something you glanced at once fades fast. Something you worked to understand, recalled a few times on the first day and checked yourself on, fades much more slowly. This is why the first few minutes of a new card matter so much; the post on [learning steps](/blog/learning-steps-explained-first-ten-minutes-of-a-new-card/) goes into this.

### Meaning and connections

Ebbinghaus chose nonsense syllables precisely because meaning helps memory. When a fact connects to things you already know, there are more ways back to it. A card that says *why* something is true, or ties a word to an example sentence, tends to last longer than an isolated fact.

### Similar material getting in the way

Things that look alike interfere with each other. Two drugs with similar names, two verbs with nearly the same meaning or two dates a year apart are easy to mix up. If you keep confusing a pair, it often helps to make a card that asks about the difference directly.

### Each successful review

This is the big one. A memory that you've recalled after a gap fades more slowly than one you've only learned once. Each successful recall flattens the curve, so the safe gap before the next review gets longer. That is the whole idea behind spaced repetition.

## How spaced repetition uses the curve

If forgetting is fastest early and slows after each review, the best plan is to review often at first and then less and less. Each review comes roughly when you're about to forget, which is when recalling takes a little effort and does the most good.

Here is the schedule Ankitti uses for a new card if you answer **Good** each time. It follows Anki-style SM-2: two short learning steps, then gaps that grow by about 2.5 times.

| Review | Gap since the last review |
| --- | --- |
| Learning step 1 | 1 minute |
| Learning step 2 | 10 minutes |
| First review | 1 day |
| Second review | about 3 days |
| Third review | about 8 days |
| Fourth review | about 20 days |
| Fifth review | about 50 days |
| Sixth review | about 4 months |

Notice how this mirrors the curve. The gaps are tiny while the memory is fragile and grow quickly once it's stable. Six reviews after the learning steps take a card to a gap of several months, about seven months after you first met it. If you forget a card, it drops back to short steps and builds up again, which is the scheduler catching it on the steep part of a fresh curve.

For how the growth factor is worked out, see the guide to the [SM-2 algorithm](/sm2-algorithm/). For the bigger picture, the [spaced repetition](/spaced-repetition/) guide covers the method from the start.

## Putting it to work in your own study

You don't need to draw any curves to use this. A few habits do the job.

1. **Review new material the same day and the next day.** That's where forgetting is fastest, so that's where a quick check pays off most. Even without flashcards, a short self-test the evening after a lecture and again the next morning helps a lot.
2. **Don't skip the early reviews.** A card due tomorrow is far more fragile than one due in two months. If you're short on time, do the young cards first.
3. **Recall, don't reread.** Looking at the answer feels like reviewing, but it doesn't flatten the curve the way recalling does. Try to produce the answer before you flip the card.
4. **Answer honestly.** If a card has slipped, press **Again**. Pretending you knew it pushes it out to a long gap it isn't ready for, and you'll meet it again forgotten. The post on [what to do when you keep forgetting the same card](/blog/what-to-do-when-you-keep-forgetting-the-same-card/) helps when one card keeps failing.
5. **Make cards meaningful.** Add a short reason, an example or a picture. Meaning slows forgetting at no extra review cost.
6. **Expect to forget some things.** Forgetting is part of the process, not a sign you're doing it wrong. What matters is catching it on time.

## If you use Ankitti

Ankitti schedules every card with the SM-2 steps shown above, so the reviews land at the right points on the curve without you tracking anything. You just do the cards due each day. You can add pictures to cards to give them more meaning, and the progress page has a 12-week calendar so you can see whether your reviews are keeping a steady rhythm. If you want a quick extra look at a deck, **Practise anyway** lets you go through it without changing its schedule.

## The takeaway

The forgetting curve says you lose new things fast, then slowly, and that each successful recall slows the next round of forgetting. Don't read too much into the exact numbers; use the shape. Review new material soon, recall instead of rereading, answer honestly and let the gaps grow. That's all spaced repetition is: meeting the curve at the right moments until the memory stops fading.
