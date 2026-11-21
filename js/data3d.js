window.LW = window.LW || {};

LW.HS = {
  dialogues: [
    { id: 'cafe', title: 'Ordering at a café', place: 'cafe', emoji: '☕',
      npc: { name: 'Barista', emoji: '🧑‍🍳' },
      goal: 'Order a drink and a snack, then pay.',
      steps: [
        { npc: 'Hi there! What can I get you?',
          options: [
            { text: 'I am wanting a hot chocolate.', why: '"Want" is a state verb, so use "I\'d like" or "Could I have".' },
            { text: 'Could I have a hot chocolate, please?', ok: true },
            { text: 'Give me hot chocolate.', why: 'Too direct. Say "Could I have…?" to sound polite.' }
          ] },
        { npc: 'Sure. Anything to eat with that?',
          options: [
            { text: 'Yes, I\'ll have a blueberry muffin, please.', ok: true },
            { text: 'Yes, I have a blueberry muffin.', why: 'Use "I\'ll have" for a decision you are making now.' },
            { text: 'Yes, give me one muffin blueberry.', why: 'Word order: "blueberry" goes before "muffin", and "give me" sounds rude.' }
          ] },
        { npc: 'Would you like to have it here or take away?',
          options: [
            { text: 'I take away it, please.', why: 'The pronoun goes in the middle: "take it away".' },
            { text: 'For taking out please.', why: '"Take away" is the usual British phrase in a café.' },
            { text: 'To take away, please. I\'m in a hurry.', ok: true }
          ] },
        { npc: 'That\'s four pounds fifty altogether.',
          options: [
            { text: 'Can I pay with the card?', why: 'We say "pay by card", without "the".' },
            { text: 'Can I pay by card?', ok: true },
            { text: 'I pay with card, yes?', why: 'Use "Can I…?" to ask about a way of paying.' }
          ] },
        { npc: 'Of course. Here is your receipt. Have a good day!',
          options: [
            { text: 'Thank you, me too!', why: '"You too" returns the wish; "me too" means you agree with something.' },
            { text: 'Yes, same to you also.', why: 'The natural reply is simply "You too"; "also" is extra.' },
            { text: 'Thank you, you too! Bye.', ok: true }
          ] }
      ] },

    { id: 'station', title: 'Buying a train ticket', place: 'station', emoji: '🚉',
      npc: { name: 'Ticket clerk', emoji: '👩‍💼' },
      goal: 'Buy a return ticket and find the right platform.',
      steps: [
        { npc: 'Good morning. Where would you like to go?',
          options: [
            { text: 'I want go to Brighton.', why: 'After "want" we need "to" plus the verb: "want to go".' },
            { text: 'I would like one ticket for Brighton return.', why: 'Word order: "a return ticket to Brighton" is the natural phrase.' },
            { text: 'A return ticket to Brighton, please.', ok: true }
          ] },
        { npc: 'Single or return?',
          options: [
            { text: 'Return, please. I\'m coming back this evening.', ok: true },
            { text: 'Return, please. I come back this evening.', why: 'A fixed future plan needs "I\'m coming back" or "I\'ll come back".' },
            { text: 'Two ways, please. Back tonight.', why: '"Two ways" is not used; the English word is "return".' }
          ] },
        { npc: 'That\'s eighteen pounds. The train leaves at ten past nine.',
          options: [
            { text: 'From which platform it leaves?', why: 'Questions need an auxiliary verb: "does it leave".' },
            { text: 'Which platform does it leave from?', ok: true },
            { text: 'Where is the platform of the train?', why: 'The natural question is "Which platform does it leave from?"' }
          ] },
        { npc: 'Platform four. Go down the stairs and turn left.',
          options: [
            { text: 'Sorry, repeat please, slow.', why: 'Make it a polite request: "Could you repeat that, please?"' },
            { text: 'Sorry, could you repeat that more slowly?', ok: true },
            { text: 'What? Again say it.', why: '"What?" sounds rude; use "Sorry?" or "Pardon?" instead.' }
          ] },
        { npc: 'Platform four. Down the stairs, then left. You have twenty minutes.',
          options: [
            { text: 'Great, thanks for your helping.', why: '"Help" is a noun here: "thanks for your help".' },
            { text: 'Great, I thank you very much for helps.', why: '"Help" is uncountable, so "helps" is wrong.' },
            { text: 'Great, thanks for your help.', ok: true }
          ] }
      ] },

    { id: 'shop', title: 'Returning a T-shirt', place: 'shop', emoji: '👕',
      npc: { name: 'Shop assistant', emoji: '🧑‍💼' },
      goal: 'Return a T-shirt that is the wrong size.',
      steps: [
        { npc: 'Hello, can I help you?',
          options: [
            { text: 'Yes, I\'d like to return this T-shirt, please.', ok: true },
            { text: 'Yes, I return this T-shirt.', why: 'Use "I\'d like to return" to make a polite request.' },
            { text: 'Yes, this T-shirt I bring back to you.', why: 'Word order: subject, verb, object: "I\'d like to return this".' }
          ] },
        { npc: 'I see. What\'s the problem with it?',
          options: [
            { text: 'It\'s too much small. I need a more big size.', why: 'Use "too small" and "bigger", not "too much small" or "more big".' },
            { text: 'It\'s too small. I need a bigger size.', ok: true },
            { text: 'It is very small, so I\'m not like it.', why: '"Like" is a state verb: "I don\'t like it".' }
          ] },
        { npc: 'Do you have the receipt?',
          options: [
            { text: 'Yes, here you go it.', why: '"Here you are" or "Here you go" needs no extra object.' },
            { text: 'Yes, I have it in home.', why: 'The preposition is "at home", not "in home".' },
            { text: 'Yes, here you are.', ok: true }
          ] },
        { npc: 'Would you like a refund or an exchange?',
          options: [
            { text: 'Exchange, please. Have you it in medium?', why: 'Ask with "Do you have…?" in modern English.' },
            { text: 'An exchange, please. Do you have it in medium?', ok: true },
            { text: 'Change, please. Do you have it on medium?', why: 'We say "in medium", and the noun is "exchange".' }
          ] },
        { npc: 'Here\'s a medium. Try it on if you like.',
          options: [
            { text: 'Thanks. Where are the changing rooms?', ok: true },
            { text: 'Thanks. Where is the rooms for changing?', why: '"Rooms" is plural, so say "Where are the changing rooms?"' },
            { text: 'Thanks. Where I can try it?', why: 'Question word order: "Where can I try it on?"' }
          ] }
      ] },

    { id: 'hotel', title: 'Checking in at a hotel', place: 'hotel', emoji: '🏨',
      npc: { name: 'Receptionist', emoji: '🛎️' },
      goal: 'Check in and ask about breakfast and Wi-Fi.',
      steps: [
        { npc: 'Good evening, welcome to the Park Hotel.',
          options: [
            { text: 'Good evening. I have reservation in the name Somchai.', why: 'Use "a reservation" and the phrase "under the name".' },
            { text: 'Good evening. I have a reservation under the name Somchai.', ok: true },
            { text: 'Good evening. I booked already a room yesterday.', why: 'Adverb position: "I already booked" or "I\'ve already booked".' }
          ] },
        { npc: 'Yes, a twin room for three nights. Could I see your passport?',
          options: [
            { text: 'Certainly, here is it.', why: 'With a pronoun the order is "here it is".' },
            { text: 'Of course, take it now.', why: 'Too abrupt. Say "Here it is" or "Here you are".' },
            { text: 'Certainly, here it is.', ok: true }
          ] },
        { npc: 'Thank you. Breakfast is served in the restaurant on the ground floor.',
          options: [
            { text: 'What time is breakfast served?', ok: true },
            { text: 'At what hour breakfast is?', why: 'Use "What time" and put the verb before the subject.' },
            { text: 'When the breakfast starts?', why: 'Questions need "does": "When does breakfast start?"' }
          ] },
        { npc: 'From seven until ten. Anything else I can help with?',
          options: [
            { text: 'Yes, tell me the Wi-Fi password.', why: 'Too direct. "Could you tell me…?" is more polite.' },
            { text: 'Yes, could you tell me the Wi-Fi password?', ok: true },
            { text: 'Yes, how is the Wi-Fi password?', why: 'Ask "What is the password?", not "How is".' }
          ] },
        { npc: 'It\'s on the card in your room. Enjoy your stay!',
          options: [
            { text: 'Thank you so much, I will enjoy.', why: '"Enjoy" needs an object: "I\'ll enjoy it" or "I will".' },
            { text: 'Thank you very much.', ok: true },
            { text: 'Thanks. I am staying good.', why: 'The natural reply is simply "Thank you" or "Thanks".' }
          ] }
      ] },

    { id: 'pharmacy', title: 'At the pharmacy', place: 'pharmacy', emoji: '💊',
      npc: { name: 'Pharmacist', emoji: '👨‍⚕️' },
      goal: 'Explain a health problem and ask about the medicine.',
      steps: [
        { npc: 'Hello. How can I help you today?',
          options: [
            { text: 'I\'ve got a sore throat and a cough.', ok: true },
            { text: 'I have pain in my throat since yesterday.', why: 'With "since" use the present perfect: "I\'ve had a sore throat".' },
            { text: 'My throat is paining me.', why: '"Pain" is usually a noun; say "my throat hurts".' }
          ] },
        { npc: 'Have you got a temperature?',
          options: [
            { text: 'No, I don\'t think.', why: 'Complete the phrase: "I don\'t think so".' },
            { text: 'No, I don\'t think so.', ok: true },
            { text: 'No, I am not thinking so.', why: '"Think" meaning believe is not used in the continuous.' }
          ] },
        { npc: 'These lozenges should help. Take one every three hours.',
          options: [
            { text: 'How much can I take in one day?', why: 'Lozenges are countable, so ask "How many".' },
            { text: 'How many I can take for a day?', why: 'Question order: "How many can I take?", and "in a day".' },
            { text: 'How many can I take in a day?', ok: true }
          ] },
        { npc: 'No more than eight. Are you allergic to anything?',
          options: [
            { text: 'No, I\'m not. Is this safe to take at school?', ok: true },
            { text: 'No. Is it safe for taking in school?', why: 'Use "safe to take" and "at school".' },
            { text: 'No, I don\'t have allergic.', why: '"Allergic" is an adjective: "I\'m not allergic" or "I have no allergies".' }
          ] },
        { npc: 'Yes, but drink plenty of water. That\'s three pounds twenty.',
          options: [
            { text: 'Here you are. Thanks for your advices.', why: '"Advice" is uncountable, so it has no plural form.' },
            { text: 'Here you are. Thanks for your advice.', ok: true },
            { text: 'Here. Thank you for advise me.', why: 'Use the noun "advice": "thanks for your advice".' }
          ] }
      ] },

    { id: 'school', title: 'Talking to a teacher', place: 'school', emoji: '🏫',
      npc: { name: 'Ms Grant', emoji: '👩‍🏫' },
      goal: 'Explain why you missed a lesson and ask for more time.',
      steps: [
        { npc: 'Good morning. You weren\'t in class yesterday.',
          options: [
            { text: 'Sorry, I was having a dentist appointment.', why: 'Use the past simple for a completed event: "I had".' },
            { text: 'I\'m sorry, I had a dentist appointment.', ok: true },
            { text: 'Sorry, I didn\'t came because the dentist.', why: 'After "didn\'t" use "come", and say "because of the dentist".' }
          ] },
        { npc: 'I see. Did you get the homework from a classmate?',
          options: [
            { text: 'Yes, but can you give me more time to Friday?', why: 'The preposition is "until Friday", not "to Friday".' },
            { text: 'Yes, but I need you give me extra time.', why: 'Make a polite request: "Could I have some extra time?"' },
            { text: 'Yes, but could I have until Friday to finish it?', ok: true }
          ] },
        { npc: 'Why do you need extra time?',
          options: [
            { text: 'Because I\'ve got two other projects due this week.', ok: true },
            { text: 'Because I have two another projects this week.', why: '"Another" is singular; use "two other projects".' },
            { text: 'Because I am having a lot of homeworks.', why: '"Homework" is uncountable, so "homeworks" is wrong.' }
          ] },
        { npc: 'All right, Friday it is. Anything else?',
          options: [
            { text: 'Can you explain me the last exercise again?', why: 'We "explain something to someone", not "explain me".' },
            { text: 'Could you explain the last exercise again, please?', ok: true },
            { text: 'Please explain again last exercise.', why: 'Missing article: it should be "the last exercise".' }
          ] },
        { npc: 'Of course. Come and see me at lunchtime.',
          options: [
            { text: 'Thank you, teacher. I will be here.', why: 'In English we address teachers by name, not as "teacher".' },
            { text: 'OK, see you at the lunch.', why: 'No article: "at lunchtime" or "at lunch".' },
            { text: 'Thank you, Ms Grant. I\'ll be there.', ok: true }
          ] }
      ] },

    { id: 'park', title: 'Asking the way in the park', place: 'park', emoji: '🌳',
      npc: { name: 'Park keeper', emoji: '🧑‍🌾' },
      goal: 'Ask the way to the lake and check the park rules.',
      steps: [
        { npc: 'Afternoon! You look a bit lost.',
          options: [
            { text: 'Excuse me, how I go to the lake?', why: 'The question needs "do": "How do I get to…?"' },
            { text: 'Excuse me, how do I get to the lake?', ok: true },
            { text: 'Hey you, where is lake?', why: '"Hey you" is rude; say "Excuse me", and use "the lake".' }
          ] },
        { npc: 'Go straight on, past the playground, and it\'s on your right.',
          options: [
            { text: 'Is it far away of here?', why: 'The preposition is "from": "far from here".' },
            { text: 'How long it takes to walk?', why: 'Question order: "How long does it take?"' },
            { text: 'Is it far from here?', ok: true }
          ] },
        { npc: 'About five minutes. Are you here for the bike race?',
          options: [
            { text: 'No, I\'m just meeting some friends for a picnic.', ok: true },
            { text: 'No, I just meet some friends for picnic.', why: 'Use "I\'m meeting" for an arranged plan, and "a picnic".' },
            { text: 'No, I\'m going to meet with my friends for picnicking.', why: 'In British English we "meet friends", and say "for a picnic".' }
          ] },
        { npc: 'Lovely. Just remember, no barbecues on the grass.',
          options: [
            { text: 'OK. Is it allowed feeding the ducks?', why: 'Pattern: "Is it allowed to feed…?" or "Can we feed…?"' },
            { text: 'OK, no problem. Can we feed the ducks?', ok: true },
            { text: 'OK. We can give food to ducks or not?', why: 'Make a proper question: "Can we feed the ducks?"' }
          ] }
      ] },

    { id: 'bank', title: 'Opening a student account', place: 'bank', emoji: '🏦',
      npc: { name: 'Bank clerk', emoji: '👨‍💼' },
      goal: 'Open a student account and ask about the card.',
      steps: [
        { npc: 'Good morning. How can I help?',
          options: [
            { text: 'I want open a student account.', why: '"Want" needs "to": "I want to open".' },
            { text: 'I like to open an account for students.', why: '"I like" means enjoy; use "I\'d like" for a request.' },
            { text: 'I\'d like to open a student account, please.', ok: true }
          ] },
        { npc: 'Certainly. Do you have some ID with you?',
          options: [
            { text: 'Yes, I\'ve brought my passport and a school letter.', ok: true },
            { text: 'Yes, I bring my passport and a school letter.', why: 'Use the present perfect for a result now: "I\'ve brought".' },
            { text: 'Yes, I have brought my passport and school\'s letter.', why: 'Say "a letter from my school", not "school\'s letter".' }
          ] },
        { npc: 'Great. Would you like a debit card with the account?',
          options: [
            { text: 'Yes, please. Does it have a monthly cost money?', why: 'Ask "Is there a fee?"; "cost money" is not a noun.' },
            { text: 'Yes, please. Is there a monthly fee?', ok: true },
            { text: 'Yes. How much it costs every month?', why: 'Question order: "How much does it cost?"' }
          ] },
        { npc: 'No fee for students. Could you fill in this form?',
          options: [
            { text: 'Sure. I must to write with capitals?', why: 'Modal verbs take no "to": "Must I write…?"' },
            { text: 'Sure. Do I have to fill it up?', why: 'For forms we say "fill in", not "fill up".' },
            { text: 'Sure. Should I write in capital letters?', ok: true }
          ] },
        { npc: 'Yes, please. Your card will arrive by post in five days.',
          options: [
            { text: 'Perfect. Thanks for helping to me.', why: 'No "to" after "help": "thanks for helping me".' },
            { text: 'Perfect. Thanks for your help.', ok: true },
            { text: 'Perfect. I\'m waiting it.', why: '"Wait" needs "for": "I\'ll wait for it".' }
          ] }
      ] },

    { id: 'cinema', title: 'At the cinema', place: 'cinema', emoji: '🎬',
      npc: { name: 'Ticket seller', emoji: '🧑‍💻' },
      goal: 'Buy two tickets, choose seats and ask for a discount.',
      steps: [
        { npc: 'Hi! Which film would you like to see?',
          options: [
            { text: 'Two tickets for Ocean Rescue at seven o\'clock in the night.', why: 'We say "in the evening" or "at night", not "in the night".' },
            { text: 'Two tickets for the seven o\'clock showing of Ocean Rescue, please.', ok: true },
            { text: 'I want two tickets for see Ocean Rescue.', why: 'Use "to see", not "for see".' }
          ] },
        { npc: 'Where would you like to sit?',
          options: [
            { text: 'Somewhere near the back, if possible.', ok: true },
            { text: 'In the back side, if it is possible.', why: 'Say "at the back", not "in the back side".' },
            { text: 'Behind, please. Not so front.', why: '"Behind" needs an object; say "near the back".' }
          ] },
        { npc: 'Row J, seats 12 and 13? That\'s fourteen pounds.',
          options: [
            { text: 'Is there discount for student?', why: 'Missing article and plural: "a discount for students".' },
            { text: 'Have you a cheaper price for students?', why: 'Use "Do you have…?" or "Is there…?" in modern English.' },
            { text: 'Is there a student discount?', ok: true }
          ] },
        { npc: 'Yes, two pounds off with a student card.',
          options: [
            { text: 'Great. Here my card and my student ID.', why: 'Missing verb: "Here is my card".' },
            { text: 'Great. Here\'s my card and my student ID.', ok: true },
            { text: 'Great. I am giving you my card.', why: 'Natural phrase when handing something over: "Here you are".' }
          ] },
        { npc: 'Enjoy the film! It starts in ten minutes.',
          options: [
            { text: 'Thanks. Which screen is it in?', ok: true },
            { text: 'Thanks. In which screen is it on?', why: 'Only one preposition is needed: "Which screen is it in?"' },
            { text: 'Thanks. Where the screen is?', why: 'Question order: "Where is the screen?"' }
          ] }
      ] },

    { id: 'library', title: 'Joining the library', place: 'library', emoji: '📚',
      npc: { name: 'Librarian', emoji: '👩‍🏫' },
      goal: 'Join the library and find a book.',
      steps: [
        { npc: 'Hello. Are you a member here?',
          options: [
            { text: 'Not yet. How can I be a member of here?', why: 'Say "join the library" or "become a member".' },
            { text: 'Not yet. How can I join?', ok: true },
            { text: 'No. I want make a card.', why: '"Want" needs "to", and we say "get a library card".' }
          ] },
        { npc: 'Just fill in this form and show me some ID.',
          options: [
            { text: 'Is it costing something to join?', why: '"Cost" is a state verb, so use the present simple.' },
            { text: 'How much I pay for enter?', why: 'Question order and "to join": "How much do I pay to join?"' },
            { text: 'Does it cost anything to join?', ok: true }
          ] },
        { npc: 'It\'s free. You can borrow up to five books at a time.',
          options: [
            { text: 'How long can I keep them for?', ok: true },
            { text: 'How long time I can keep them?', why: 'Say "How long", not "how long time", and "can I".' },
            { text: 'Until when I must give back?', why: 'Use "return" and question order: "When do I have to return them?"' }
          ] },
        { npc: 'Three weeks. Is there a particular book you\'re looking for?',
          options: [
            { text: 'Yes, I look for a book about the climate change.', why: 'Use "I\'m looking for" now, and no article before "climate change".' },
            { text: 'Yes, I\'m looking for a book about climate change.', ok: true },
            { text: 'Yes, I search a book about climate change.', why: '"Search for" or "look for"; "search a book" means look inside it.' }
          ] },
        { npc: 'Non-fiction is upstairs, section 360. Ask if you need help.',
          options: [
            { text: 'Thanks. Can I make the books longer online?', why: 'The verb is "renew" a book, not "make it longer".' },
            { text: 'Thanks. Is possible to renew online?', why: 'Missing subject: "Is it possible to renew…?"' },
            { text: 'Thanks. Can I renew books online as well?', ok: true }
          ] }
      ] },

    { id: 'market', title: 'Bargaining at the market', place: 'market', emoji: '🍉',
      npc: { name: 'Stallholder', emoji: '🧑‍🌾' },
      goal: 'Buy fruit and ask politely for a better price.',
      steps: [
        { npc: 'Morning! Lovely mangoes today, fresh from the farm.',
          options: [
            { text: 'How much is the mangoes?', why: '"Mangoes" is plural, so use "are".' },
            { text: 'How much are the mangoes?', ok: true },
            { text: 'What is the price for one mango cost?', why: 'Choose one: "What\'s the price?" or "How much does it cost?"' }
          ] },
        { npc: 'Two pounds each, or three for five pounds.',
          options: [
            { text: 'I\'ll take three, please. Are they ripe?', ok: true },
            { text: 'I take three, please. Are they mature?', why: 'Fruit is "ripe"; "mature" is used for people and cheese.' },
            { text: 'Give me three. They are ready for eat?', why: 'Too direct, and say "ready to eat".' }
          ] },
        { npc: 'Perfectly ripe. Anything else? The strawberries are on offer.',
          options: [
            { text: 'Can you make the price more cheap for two boxes?', why: 'The comparative is "cheaper", not "more cheap".' },
            { text: 'Discount me if I buy two boxes.', why: '"Discount" is not used as a verb with a person.' },
            { text: 'Could you do a better price if I buy two boxes?', ok: true }
          ] },
        { npc: 'Go on then, two boxes for three pounds.',
          options: [
            { text: 'Deal! That is eight pounds in total, no?', why: 'Use a question tag: "…, isn\'t it?" instead of "no?".' },
            { text: 'Deal! That\'s eight pounds altogether, isn\'t it?', ok: true },
            { text: 'Deal! All is eight pounds, is it?', why: 'A positive statement takes a negative tag: "That\'s eight pounds, isn\'t it?"' }
          ] }
      ] },

    { id: 'bus', title: 'On the bus', place: 'bus', emoji: '🚌',
      npc: { name: 'Bus driver', emoji: '🧑‍✈️' },
      goal: 'Check the route, buy a ticket and find your stop.',
      steps: [
        { npc: 'Hop on. Where are you heading?',
          options: [
            { text: 'This bus goes to the National Museum?', why: 'Questions need an auxiliary: "Does this bus go…?"' },
            { text: 'Does this bus go to the National Museum?', ok: true },
            { text: 'Is this bus going at the National Museum?', why: 'Preposition: we go "to" a place, not "at".' }
          ] },
        { npc: 'It does. Single or day ticket?',
          options: [
            { text: 'A single, please. How much is it?', ok: true },
            { text: 'One single, please. How much it is?', why: 'Question order: the verb comes first, "How much is it?"' },
            { text: 'Only one way, please. How many is it?', why: 'For prices ask "How much", not "How many".' }
          ] },
        { npc: 'Two pounds. Tap your card or pay in cash.',
          options: [
            { text: 'I pay with cash. Say me when we arrive.', why: 'We "tell someone", never "say someone".' },
            { text: 'I will pay by the cash. When we arrive?', why: 'No article: "in cash" or "by card", and "When do we arrive?"' },
            { text: 'I\'ll pay in cash. Could you tell me when we get there?', ok: true }
          ] },
        { npc: 'Sure. It\'s about twenty minutes. Take a seat.',
          options: [
            { text: 'Thanks. Is it the stop after of the hospital?', why: '"After" takes no "of": "after the hospital".' },
            { text: 'Thanks. Is it the stop after the hospital?', ok: true },
            { text: 'Thanks. It is the stop next the hospital?', why: '"Next to" needs "to", and questions start with "Is it".' }
          ] },
        { npc: 'That\'s right. I\'ll give you a shout.',
          options: [
            { text: 'Brilliant, thank you very much.', ok: true },
            { text: 'Brilliant, I thank you very much for.', why: '"For" needs an object; just say "Thank you very much".' },
            { text: 'Good. You are very kind man.', why: 'Missing article: "a very kind man"; "Thank you" is enough here.' }
          ] }
      ] }
  ],

  sentences: [
    { id: 's01', topic: 'present perfect', words: ['I', 'have', 'never', 'been', 'to', 'Japan', 'before.'] },
    { id: 's02', topic: 'present perfect', words: ['She', 'has', 'just', 'finished', 'her', 'science', 'homework.'] },
    { id: 's03', topic: 'present perfect', words: ['We', 'have', 'known', 'each', 'other', 'since', 'primary', 'school.'] },
    { id: 's04', topic: 'present perfect', words: ['Have', 'you', 'ever', 'played', 'volleyball', 'on', 'the', 'beach?'] },
    { id: 's05', topic: 'present perfect', words: ['My', 'brother', 'hasn\'t', 'eaten', 'anything', 'since', 'this', 'morning.'] },
    { id: 's06', topic: 'present perfect', words: ['They', 'have', 'lived', 'in', 'Chiang', 'Mai', 'for', 'ten', 'years.'] },

    { id: 's07', topic: 'past continuous', words: ['I', 'was', 'doing', 'my', 'homework', 'when', 'the', 'lights', 'went', 'out.'] },
    { id: 's08', topic: 'past continuous', words: ['While', 'we', 'were', 'waiting,', 'it', 'started', 'to', 'rain.'] },
    { id: 's09', topic: 'past continuous', words: ['She', 'was', 'listening', 'to', 'music', 'when', 'her', 'phone', 'rang.'] },
    { id: 's10', topic: 'past continuous', words: ['What', 'were', 'you', 'doing', 'at', 'eight', 'o\'clock', 'last', 'night?'] },
    { id: 's11', topic: 'past continuous', words: ['The', 'students', 'were', 'still', 'talking', 'when', 'the', 'teacher', 'arrived.'] },
    { id: 's12', topic: 'past continuous', words: ['It', 'was', 'raining', 'hard', 'when', 'we', 'left', 'school.'] },

    { id: 's13', topic: 'first conditional', words: ['If', 'it', 'rains', 'tomorrow,', 'we', 'will', 'stay', 'at', 'home.'] },
    { id: 's14', topic: 'first conditional', words: ['If', 'you', 'don\'t', 'hurry,', 'you', 'will', 'miss', 'the', 'bus.'] },
    { id: 's15', topic: 'first conditional', words: ['I', 'will', 'call', 'you', 'if', 'I', 'need', 'any', 'help.'] },
    { id: 's16', topic: 'first conditional', words: ['Unless', 'we', 'leave', 'now,', 'we', 'won\'t', 'catch', 'the', 'train.'] },
    { id: 's17', topic: 'first conditional', words: ['What', 'will', 'you', 'do', 'if', 'the', 'shop', 'is', 'closed?'] },
    { id: 's18', topic: 'first conditional', words: ['If', 'she', 'wins', 'the', 'race,', 'she', 'will', 'be', 'famous.'] },

    { id: 's19', topic: 'second conditional', words: ['If', 'I', 'were', 'you,', 'I', 'would', 'apologise.'] },
    { id: 's20', topic: 'second conditional', words: ['If', 'I', 'had', 'more', 'money,', 'I', 'would', 'travel', 'the', 'world.'] },
    { id: 's21', topic: 'second conditional', words: ['What', 'would', 'you', 'do', 'if', 'you', 'found', 'a', 'wallet?'] },
    { id: 's22', topic: 'second conditional', words: ['She', 'would', 'be', 'happier', 'if', 'she', 'had', 'fewer', 'exams.'] },
    { id: 's23', topic: 'second conditional', words: ['If', 'we', 'lived', 'by', 'the', 'sea,', 'we', 'would', 'surf.'] },
    { id: 's24', topic: 'second conditional', words: ['I', 'wouldn\'t', 'eat', 'that', 'if', 'I', 'were', 'you.'] },

    { id: 's25', topic: 'passive voice', words: ['The', 'school', 'was', 'built', 'in', '1965.'] },
    { id: 's26', topic: 'passive voice', words: ['English', 'is', 'spoken', 'in', 'many', 'countries', 'around', 'the', 'world.'] },
    { id: 's27', topic: 'passive voice', words: ['The', 'winners', 'will', 'be', 'announced', 'next', 'Friday.'] },
    { id: 's28', topic: 'passive voice', words: ['My', 'phone', 'was', 'stolen', 'on', 'the', 'bus', 'yesterday.'] },
    { id: 's29', topic: 'passive voice', words: ['These', 'shoes', 'are', 'made', 'of', 'recycled', 'plastic.'] },
    { id: 's30', topic: 'passive voice', words: ['Has', 'the', 'homework', 'been', 'marked', 'by', 'the', 'teacher', 'yet?'] },

    { id: 's31', topic: 'reported speech', words: ['She', 'said', 'that', 'she', 'was', 'tired.'] },
    { id: 's32', topic: 'reported speech', words: ['He', 'told', 'me', 'he', 'would', 'call', 'me', 'later.'] },
    { id: 's33', topic: 'reported speech', words: ['The', 'teacher', 'asked', 'us', 'why', 'we', 'were', 'late.'] },
    { id: 's34', topic: 'reported speech', words: ['My', 'mum', 'said', 'that', 'dinner', 'was', 'nearly', 'ready.'] },
    { id: 's35', topic: 'reported speech', words: ['They', 'asked', 'me', 'if', 'I', 'could', 'help', 'them.'] },
    { id: 's36', topic: 'reported speech', words: ['Tom', 'said', 'he', 'couldn\'t', 'come', 'to', 'the', 'party.'] },

    { id: 's37', topic: 'relative clauses', words: ['The', 'girl', 'who', 'sits', 'next', 'to', 'me', 'is', 'from', 'Japan.'] },
    { id: 's38', topic: 'relative clauses', words: ['This', 'is', 'the', 'app', 'which', 'I', 'use', 'every', 'day.'] },
    { id: 's39', topic: 'relative clauses', words: ['That\'s', 'the', 'café', 'where', 'we', 'usually', 'meet.'] },
    { id: 's40', topic: 'relative clauses', words: ['Maya', 'is', 'the', 'student', 'whose', 'project', 'won', 'first', 'prize.'] },
    { id: 's41', topic: 'relative clauses', words: ['The', 'book', 'that', 'you', 'lent', 'me', 'was', 'brilliant.'] },
    { id: 's42', topic: 'relative clauses', words: ['People', 'who', 'exercise', 'every', 'day', 'feel', 'less', 'stressed.'] },

    { id: 's43', topic: 'comparatives and superlatives', words: ['Cycling', 'to', 'school', 'is', 'cheaper', 'than', 'taking', 'the', 'bus.'] },
    { id: 's44', topic: 'comparatives and superlatives', words: ['This', 'is', 'the', 'best', 'pizza', 'I', 'have', 'ever', 'eaten.'] },
    { id: 's45', topic: 'comparatives and superlatives', words: ['The', 'exam', 'was', 'more', 'difficult', 'than', 'I', 'expected.'] },
    { id: 's46', topic: 'comparatives and superlatives', words: ['Bangkok', 'is', 'one', 'of', 'the', 'busiest', 'cities', 'in', 'Asia.'] },
    { id: 's47', topic: 'comparatives and superlatives', words: ['She', 'is', 'the', 'most', 'talented', 'player', 'in', 'our', 'team.'] },
    { id: 's48', topic: 'comparatives and superlatives', words: ['Online', 'lessons', 'are', 'not', 'as', 'fun', 'as', 'real', 'ones.'] }
  ],

  gaps: [
    { id: 'g01', topic: 'conditionals', prompt: 'If it ___ tomorrow, we will stay at home.', options: ['rains', 'will rain', 'rained', 'is raining'], answer: 0, rule: 'First conditional: if + present simple, will + verb.' },
    { id: 'g02', topic: 'conditionals', prompt: 'If I ___ you, I would talk to the teacher.', options: ['am', 'was being', 'were', 'will be'], answer: 2, rule: 'Second conditional uses "were" after "if" for all persons.' },
    { id: 'g03', topic: 'conditionals', prompt: 'We ___ the match if we practise every day.', options: ['winning', 'would win', 'won', 'will win'], answer: 3, rule: 'First conditional: present simple in the if-clause, "will" in the result.' },
    { id: 'g04', topic: 'conditionals', prompt: 'If she had more time, she ___ learn the guitar.', options: ['will', 'would', 'is going to', 'can'], answer: 1, rule: 'Second conditional: if + past simple, would + verb.' },
    { id: 'g05', topic: 'conditionals', prompt: 'If you ___ ice, it melts.', options: ['heat', 'will heat', 'heated', 'would heat'], answer: 0, rule: 'Zero conditional: present simple in both parts for general truths.' },
    { id: 'g06', topic: 'conditionals', prompt: 'You won\'t pass the test ___ you revise.', options: ['if', 'unless', 'when', 'because'], answer: 1, rule: '"Unless" means "if not": you won\'t pass if you don\'t revise.' },

    { id: 'g07', topic: 'tenses', prompt: 'I ___ my homework yet.', options: ['didn\'t finish', 'haven\'t finished', 'don\'t finish', 'am not finishing'], answer: 1, rule: 'Use the present perfect with "yet" for unfinished actions up to now.' },
    { id: 'g08', topic: 'tenses', prompt: 'At nine o\'clock last night I ___ my homework.', options: ['do', 'was doing', 'have done', 'am doing'], answer: 1, rule: 'Past continuous describes an action in progress at a past time.' },
    { id: 'g09', topic: 'tenses', prompt: 'Look! Those kids ___ football on the road.', options: ['play', 'plays', 'played', 'are playing'], answer: 3, rule: '"Look!" signals an action happening now: use the present continuous.' },
    { id: 'g10', topic: 'tenses', prompt: 'My grandmother ___ in this village since 1980.', options: ['lives', 'lived', 'is living', 'has lived'], answer: 3, rule: '"Since" plus a starting point needs the present perfect.' },
    { id: 'g11', topic: 'tenses', prompt: 'We ___ to the cinema last Saturday.', options: ['go', 'have gone', 'went', 'have been'], answer: 2, rule: 'A finished time like "last Saturday" takes the past simple.' },
    { id: 'g12', topic: 'tenses', prompt: 'She ___ her keys, so she couldn\'t open the door.', options: ['loses', 'has lost', 'is losing', 'had lost'], answer: 3, rule: 'Past perfect shows an action before another past action.' },

    { id: 'g13', topic: 'modal verbs', prompt: 'You ___ wear a helmet when you ride a motorbike. It\'s the law.', options: ['must', 'might', 'could', 'would'], answer: 0, rule: '"Must" expresses a strong obligation or a rule.' },
    { id: 'g14', topic: 'modal verbs', prompt: 'You ___ bring food. There will be plenty at the party.', options: ['mustn\'t', 'don\'t have to', 'can\'t', 'shouldn\'t'], answer: 1, rule: '"Don\'t have to" means it is not necessary.' },
    { id: 'g15', topic: 'modal verbs', prompt: '___ I borrow your charger for a minute?', options: ['Have', 'Must', 'Could', 'Would'], answer: 2, rule: 'Use "Could I…?" to ask for permission politely.' },
    { id: 'g16', topic: 'modal verbs', prompt: 'It\'s cold outside. You ___ take a jacket.', options: ['should', 'must to', 'ought', 'have'], answer: 0, rule: '"Should" gives advice; "ought" needs "to" and "must" takes no "to".' },
    { id: 'g17', topic: 'modal verbs', prompt: 'That ___ be Anna\'s bag. She went home an hour ago.', options: ['can\'t', 'mustn\'t', 'shouldn\'t', 'doesn\'t have to'], answer: 0, rule: 'For something logically impossible use "can\'t", not "mustn\'t".' },
    { id: 'g18', topic: 'modal verbs', prompt: 'When I was six, I ___ already swim.', options: ['can', 'could', 'was able', 'must'], answer: 1, rule: '"Could" is the past form of "can" for ability.' },

    { id: 'g19', topic: 'prepositions', prompt: 'My birthday is ___ the fifteenth of March.', options: ['on', 'in', 'at', 'by'], answer: 0, rule: 'Use "on" with dates and days of the week.' },
    { id: 'g20', topic: 'prepositions', prompt: 'I\'m really interested ___ marine biology.', options: ['on', 'in', 'at', 'for'], answer: 1, rule: '"Interested" is always followed by the preposition "in".' },
    { id: 'g21', topic: 'prepositions', prompt: 'She arrived ___ Bangkok late at night.', options: ['to', 'at', 'on', 'in'], answer: 3, rule: 'Arrive "in" a city or country, "at" a building.' },
    { id: 'g22', topic: 'prepositions', prompt: 'We usually have lunch ___ noon.', options: ['at', 'in', 'on', 'during'], answer: 0, rule: 'Use "at" with clock times and with "noon" or "midnight".' },
    { id: 'g23', topic: 'prepositions', prompt: 'He\'s been working here ___ three years.', options: ['since', 'from', 'for', 'during'], answer: 2, rule: '"For" goes with a period of time; "since" with a starting point.' },
    { id: 'g24', topic: 'prepositions', prompt: 'Thanks ___ helping me with my project.', options: ['to', 'of', 'about', 'for'], answer: 3, rule: 'We always say "thanks for" plus a noun or -ing form.' },

    { id: 'g25', topic: 'articles and quantifiers', prompt: 'There isn\'t ___ milk left in the fridge.', options: ['many', 'a few', 'some', 'any'], answer: 3, rule: 'Use "any" in negatives with uncountable nouns.' },
    { id: 'g26', topic: 'articles and quantifiers', prompt: 'She plays ___ piano beautifully.', options: ['a', 'an', 'the', 'some'], answer: 2, rule: 'We use "the" with musical instruments.' },
    { id: 'g27', topic: 'articles and quantifiers', prompt: 'How ___ sugar do you take in your tea?', options: ['many', 'few', 'lot', 'much'], answer: 3, rule: '"Much" goes with uncountable nouns like "sugar".' },
    { id: 'g28', topic: 'articles and quantifiers', prompt: 'He is ___ engineer at a big company.', options: ['a', 'an', 'one', 'some'], answer: 1, rule: 'Use "an" before a vowel sound: "an engineer".' },
    { id: 'g29', topic: 'articles and quantifiers', prompt: 'Hurry up! There is ___ time before the bus leaves.', options: ['few', 'a few', 'little', 'many'], answer: 2, rule: '"Little" with an uncountable noun means not much.' },
    { id: 'g30', topic: 'articles and quantifiers', prompt: 'I\'d like ___ information about the course, please.', options: ['an', 'a few', 'many', 'some'], answer: 3, rule: '"Information" is uncountable, so use "some".' },

    { id: 'g31', topic: 'question tags and short answers', prompt: 'You\'re coming to the party, ___?', options: ['are you', 'aren\'t you', 'don\'t you', 'isn\'t it'], answer: 1, rule: 'Positive statement, negative tag: repeat the auxiliary "are".' },
    { id: 'g32', topic: 'question tags and short answers', prompt: 'She doesn\'t like spicy food, ___?', options: ['does she', 'doesn\'t she', 'is she', 'likes she'], answer: 0, rule: 'A negative statement takes a positive tag with the same auxiliary.' },
    { id: 'g33', topic: 'question tags and short answers', prompt: '"Do you play basketball?" "Yes, I ___."', options: ['play', 'am', 'do', 'does'], answer: 2, rule: 'Short answers repeat the auxiliary verb from the question.' },
    { id: 'g34', topic: 'question tags and short answers', prompt: 'They went to Phuket last year, ___?', options: ['did they', 'didn\'t they', 'weren\'t they', 'don\'t they'], answer: 1, rule: 'Past simple statements use "didn\'t" in the tag.' },
    { id: 'g35', topic: 'question tags and short answers', prompt: '"Has he finished his homework?" "No, he ___."', options: ['hasn\'t', 'doesn\'t', 'isn\'t', 'didn\'t'], answer: 0, rule: 'Answer with the same auxiliary: "has" becomes "hasn\'t".' },
    { id: 'g36', topic: 'question tags and short answers', prompt: 'Let\'s go to the beach, ___?', options: ['do we', 'will we', 'shall we', 'don\'t we'], answer: 2, rule: '"Let\'s" always takes the question tag "shall we".' }
  ],

  pairs: [
    { id: 'p01', title: 'Phrasal verbs: everyday life', pairs: [
      ['give up', 'stop trying'], ['look after', 'take care of'], ['put off', 'postpone'], ['find out', 'discover'], ['turn down', 'refuse']
    ] },
    { id: 'p02', title: 'Phrasal verbs: school and study', pairs: [
      ['hand in', 'submit'], ['look up', 'search for'], ['catch up', 'reach the same level'], ['drop out', 'leave a course'], ['work out', 'solve']
    ] },
    { id: 'p03', title: 'Phrasal verbs: friends and people', pairs: [
      ['get on with', 'have a good relationship'], ['fall out', 'stop being friends'], ['hang out', 'spend time together'], ['let down', 'disappoint'], ['make up', 'become friends again']
    ] },
    { id: 'p04', title: 'Phrasal verbs: technology', pairs: [
      ['turn on', 'start a device'], ['log in', 'enter an account'], ['back up', 'save a copy'], ['scroll down', 'move the page down'], ['switch off', 'stop a device']
    ] },
    { id: 'p05', title: 'Phrasal verbs: travel', pairs: [
      ['set off', 'start a journey'], ['check in', 'register at a hotel'], ['get on', 'board a bus'], ['take off', 'leave the ground'], ['pick up', 'collect someone']
    ] },
    { id: 'p06', title: 'Phrasal verbs: shopping and money', pairs: [
      ['pay back', 'return money'], ['try on', 'test clothes for size'], ['run out of', 'have no more'], ['save up', 'keep money for later'], ['queue up', 'wait in a line']
    ] },
    { id: 'p07', title: 'Collocations: make, do, take, have, tell', pairs: [
      ['make', 'a mistake'], ['do', 'your homework'], ['take', 'a photo'], ['have', 'a headache'], ['tell', 'the truth']
    ] },
    { id: 'p08', title: 'Collocations: everyday actions', pairs: [
      ['brush', 'your teeth'], ['ride', 'a bike'], ['score', 'a goal'], ['keep', 'a secret'], ['solve', 'a problem']
    ] },
    { id: 'p09', title: 'Collocations: achievements and problems', pairs: [
      ['break', 'a record'], ['lose', 'your temper'], ['pass', 'an exam'], ['catch', 'a cold'], ['win', 'a prize']
    ] },
    { id: 'p10', title: 'Word formation: adjectives', pairs: [
      ['create', 'creative'], ['danger', 'dangerous'], ['success', 'successful'], ['comfort', 'comfortable'], ['health', 'healthy']
    ] },
    { id: 'p11', title: 'Word formation: nouns', pairs: [
      ['educate', 'education'], ['happy', 'happiness'], ['govern', 'government'], ['decide', 'decision'], ['friend', 'friendship']
    ] },
    { id: 'p12', title: 'Word formation: people', pairs: [
      ['teach', 'teacher'], ['science', 'scientist'], ['music', 'musician'], ['act', 'actor'], ['employ', 'employee']
    ] }
  ],

  forms: [
    { id: 'f01', prompt: 'She is a very ___ person who loves drawing. (CREATE)', answer: 'creative' },
    { id: 'f02', prompt: 'Good ___ is important for everyone. (EDUCATE)', answer: 'education' },
    { id: 'f03', prompt: 'The ___ of the new library took two years. (CONSTRUCT)', answer: 'construction' },
    { id: 'f04', prompt: 'The ___ announced new rules for schools. (GOVERN)', answer: 'government' },
    { id: 'f05', prompt: 'Money can\'t buy ___. (HAPPY)', answer: 'happiness' },
    { id: 'f06', prompt: 'Thank you for your ___. (KIND)', answer: 'kindness' },
    { id: 'f07', prompt: 'What a ___ view from the mountain! (BEAUTY)', answer: 'beautiful' },
    { id: 'f08', prompt: 'Without a signal, my phone was completely ___. (USE)', answer: 'useless' },
    { id: 'f09', prompt: 'Smoking is very ___ to your health. (HARM)', answer: 'harmful' },
    { id: 'f10', prompt: 'This bag is ___, so it can go in the machine. (WASH)', answer: 'washable' },
    { id: 'f11', prompt: 'My uncle is a very ___ businessman. (SUCCESS)', answer: 'successful' },
    { id: 'f12', prompt: 'She ___ opened the door so nobody would hear. (QUIET)', answer: 'quietly' },
    { id: 'f13', prompt: 'Please drive ___ on wet roads. (CARE)', answer: 'carefully' },
    { id: 'f14', prompt: 'If you answer all the questions ___, you win. (CORRECT)', answer: 'correctly' },
    { id: 'f15', prompt: 'The students listened ___ to the story. (ATTENTION)', answer: 'attentively' },
    { id: 'f16', prompt: 'The road is closed, so it is ___ to park here. (POSSIBLE)', answer: 'impossible' },
    { id: 'f17', prompt: 'He was ___ to find his keys, so he was late. (ABLE)', answer: 'unable' },
    { id: 'f18', prompt: 'We ___ about everything, so we never work together. (AGREE)', answer: 'disagree' },
    { id: 'f19', prompt: 'Breaking into a house is ___. (LEGAL)', answer: 'illegal' },
    { id: 'f20', prompt: 'The teacher became ___ and shouted at us. (PATIENT)', answer: 'impatient' },
    { id: 'f21', prompt: 'The room was so ___ that I couldn\'t find anything. (TIDY)', answer: 'untidy' },
    { id: 'f22', prompt: 'The film was so ___ that we left early. (BORE)', answer: 'boring' },
    { id: 'f23', prompt: 'The hotel staff were very ___ and polite. (HELP)', answer: 'helpful' },
    { id: 'f24', prompt: 'Our ___ started in primary school. (FRIEND)', answer: 'friendship' }
  ],
  keySpots: [
    { id: 'plant', name: 'Potted plant', emoji: '🌿', riddle: 'It is green, it lives in a pot and it needs water every week.' },
    { id: 'radio', name: 'Radio', emoji: '📻', riddle: 'It plays music and the news, but it has no screen.' },
    { id: 'lamp',  name: 'Desk lamp', emoji: '💡', riddle: 'You switch it on when it gets dark and you want to read.' },
    { id: 'coat',  name: 'Coat rack', emoji: '🧥', riddle: 'You hang your jacket and your hat on it when you come in.' }
  ]
};
