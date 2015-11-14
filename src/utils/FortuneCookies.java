package utils;

public class FortuneCookies {

	private static final String[] cookies = new String[] {
			"Ok, but first coffie", //
			"You wanna look like a million you gotta spend a million", //
			"You have accurately portrayed the nature of my grievance", //
			"You have increased cortisol levels", //
			"I love how your fingers flutter across the keyboard", //
			"Follow my lead", //
			"Meh", //
			"Do not haste any longer", //
			"The end is near", //
			"Take your time today", //
"Today is a huge improvement over yesterday", //
"You're gonna have a thrilling time", //			
"Someone has googled you recently", //
"You will get hungry", //
"?", //
"Initiating auto-destruct sequence in 3,2,1...", //
"Abort now", //
"java.lang.NullPointerException. Just kidding. Oh wait", //			
"Sleep", //
"Run", //
"I cannot help you", //
"Keep trying", //			
"Go home",//
"Fine", //
"Ice cream soup", //
"Making fun of someones name is pretty immature", //
"Gobbledegook", //
"Come on-a my house, my house, I'm gonna give you candy",


//---TEAM AMERICA---//
"Remember, there's is no I in Team America",
"Great job, team. Head back to base for debriefing and cocktails",



//---INSERT BENDER QUOTES HERE---//

"Anything less than immortality is a complete waste of time", //
"Let the looting begin", //


//---CHARLIE SHEEN CLASSICS GO HERE---//

"You can't process me with a normal brain", //
"I'm sorry, man, but I've got magic", //

//---RAMPAGE JACKSON :) ---//

"Well, right now I'm 23, so in two years, I see myself 25", //
"He's in the video game, and I'm not", //
"My momma said never trust a catfish with a mustache", //
"I don't mean to make excuses for all my losses, but I can make excuses for all my losses", //

//---THE GODFATHER :) ---//

"Never let anyone know what you are thinking", //
"Just when I thought I was out.. they pull me back in", //

//---SIMPSONS ---//

"Do I know what rhetorical means?", //
"Homer no function beer well without", //
"Pffft. Who needs English? I'm never going to England", //

//---STARCRAFT ---//

"Y'all need some good ol' fashioned discipline", //
"Is something burning?",// -- Firebat", //
"Somebody call for an exterminator?",// -- Ghost", //
"I'm about to overload my aggression inhibitors",// -- Ghost", //
"I vote we frag this commander",// -- Marine",
"Need medical attention?", //			
"Nuclear launch detected", //

//---GANG ALBANII ---//

"habarala habarala hesk",

//--- ACTION BRONSON ---//
"Eat burgers, they're good for you",
"I question your mother's upbringing if you don't like me",

//---DAVE JONES---//

"What a bobby dazzler",
"Bob's your uncle",
"Good enough for Australia",
"In like Flynn. Errol that is",
"Feels like a brick dunny",
"Dry as a dead dingo's donger",

// --- Bruce Campbell --- //

"Good, bad, I'm the guy with the gun" ,
"Groovy" ,
"Do not question my authority for it is supreme",
"Bruce Campbell has fought the Army of the Dead",
"Bruce Campbell cut off his own hand and replaced it with a chainsaw",
"Bruce Campbell fought Guan Di, the Chinese protector of the dead",
"Bruce Campbell escaped from the highest security prison in the galaxy",
"Bruce Campbell went to the moon",
"Bruce Campbell is an ex CIA operative",
"Bruce Campbell will lead the human slaves against the alien invasion",
"Bruce Campbell Slays Deadites and Slings One-liners",
"Alright you Primitive Screwheads, listen up! You see this? This... is my boomstick! The twelve-gauge double-barreled Remington. S-Mart's top of the line.",
"Come get some.",
"Name's Ash. [cocks rifle]. Housewares.",

// ---DOC BROWN ---//

"Great Scott!",


	};

	public static String nextCookie() {

		String cookieSelection = (String) Utils.pickRand(cookies);

		return cookieSelection;
	}// END: nextCookie

}// END: class
