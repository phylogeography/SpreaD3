package test;

import org.joda.time.DateTime;
import org.joda.time.Duration;
import org.joda.time.Interval;
import org.joda.time.LocalDate;
import org.joda.time.Period;

public class Test {

	public static void main(String[] args) {

		try {

			int sliceCount = 10;

			String startTime = "2010-01-01";
			DateTime startDate = new DateTime(startTime);

			String endTime = "2011-01-02";
			DateTime endDate = new DateTime(endTime);

			Interval interval = new Interval(startDate, endDate);
			long millis = interval.toDurationMillis();
			long segmentMillis = millis / (sliceCount - 1);
			
			System.out.println("startDate: " + new LocalDate(startDate).toString());
			
			for (int i = 0; i < sliceCount; i++) {

				Duration duration = new Duration(segmentMillis * i );
				System.out.println("\t" + new LocalDate(startDate.plus(duration)));
				
				
			}

			System.out.println("endDate: " + new LocalDate(endDate).toString());

		} catch (Exception e) {
			e.printStackTrace();
		}

	}// END: main

}// END: class
