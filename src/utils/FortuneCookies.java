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

//---INSERT BENDER QUOTES HERE---//

"Anything less than immortality is a complete waste of time -- Bender", //
"Let the looting begin -- Bender", //


//---CHARLIE SHEEN CLASSICS GO HERE---//

"You can't process me with a normal brain -- Charlie Sheen", //
"I'm sorry, man, but I've got magic -- Charlie Sheen", //

//---RAMPAGE JACKSON :) ---//

"Well, right now I'm 23, so in two years, I see myself 25  -- Quinton 'Rampage' Jackson", //
"He's in the video game, and I'm not -- Quinton 'Rampage' Jackson", //
"My momma said never trust a catfish with a mustache -- Quinton 'Rampage' Jackson", //
"I don't mean to make excuses for all my losses, but I can make excuses for all my losses -- Quinton 'Rampage' Jackson", //

//---THE GODFATHER :) ---//

"Never let anyone know what you are thinking -- Don Vito Corelone", //
"Just when I thought I was out.. they pull me back in -- Michael Corleone", //

//---SIMPSONS ---//

"Do I know what rhetorical means? -- Homer Simpson", //
"Homer no function beer well without -- Homer Simpson", //
"Pffft. Who needs English? I'm never going to England -- Homer Simpson", //

//---STARCRAFT ---//

"Y'all need some good ol' fashioned discipline -- Edmund Duke", //
"Is something burning?",// -- Firebat", //
"Somebody call for an exterminator?",// -- Ghost", //
"I'm about to overload my aggression inhibitors",// -- Ghost", //
"I vote we frag this commander",// -- Marine",
"Need medical attention?", //			
"Nuclear launch detected", //

//---GANG ALBANII ---//

"habarala habarala hesk -- Popek",

//--- ACTION BRONSON ---//
"Eat burgers, they're good for you -- Action Bronson",
"I question your mother's upbringing if you don't like me  -- Action Bronson",

//---DAVE JONES---//

"What a bobby dazzler",
"...And Bob's your uncle"


	};

	public static String nextCookie() {

		String cookieSelection = (String) Utils.pickRand(cookies);

		return cookieSelection;
	}// END: nextCookie

}// END: class
