package utils;

public class ProgressBar extends Thread {

	private static final String anim = "|/-\\";
	private boolean showProgress;
	double progressPercentage;
	private final int barLength;

	public ProgressBar(int barLength) {
		this.barLength = barLength;
		this.showProgress = true;
		this.progressPercentage = 0;
	}

	public void run() {

		int i = 0;

		while (showProgress) {

			String progress = "\r[";
			int column = (int) (progressPercentage * (barLength ));
			
			//TODO
//			System.out.println(column);
			
			int j = 0;
			for (; j < column-1; j++) {
				progress += ("*");
			}

			String whitespace="";
			for (; j < barLength - 2; j++) {
				whitespace+=(" ");
			}
			whitespace+=("]");
			
			System.out.print(progress + anim.charAt(i++ % anim.length()) + whitespace);

			try {

				Thread.sleep(10);

			} catch (Exception e) {
				// do nothing
			}// END: try-catch

		}// END: while

		
	}// END: run

	public void showCompleted() {
		String progress = "\r[";
		for(int ii =0;ii<barLength-1; ii++) {
			progress += ("*");
		}
		progress += ("]");
		System.out.print(progress);
	}
	
	public void setShowProgress(boolean showProgress) {
		this.showProgress = showProgress;
	}

	public void setProgressPercentage(double progressPercentage) {
		this.progressPercentage = progressPercentage;
	}
}// END: class