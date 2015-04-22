package test;


public class Test {

	// https://sites.google.com/site/gson/gson-user-guide#TOC-Using-Gson

	public static void main(String[] args) {

		try {

//			ContinuousTreeTest.testContinousTreeToJSON();
			DiscreteTreeTest.testDiscreteTreeToJSON();

			System.out.println("Finished");

		} catch (Exception e) {
			e.printStackTrace();
		}

	}// END: main

}// END: class
