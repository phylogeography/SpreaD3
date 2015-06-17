package test;

public class Test {

	public static void main(String[] args) {

		try {

			int barLength = 100;
			int jobLength = 501;
			double stepSize = (double) barLength / (double) jobLength;

			ProgressBar progressBar = new ProgressBar(barLength);
			progressBar.start();

			System.out
					.println("0                        25                       50                       75                       100%");
			System.out
					.println("|------------------------|------------------------|------------------------|------------------------|");

			for (int i = 0; i <= jobLength; i++) {

				Thread.sleep(100);

				double progress = (stepSize * i) / barLength;
                progressBar.setProgressPercentage(progress);
				
			}

			progressBar.setShowProgress(false);

		} catch (Exception e) {
			e.printStackTrace();
		}

	}// END: main

	static class ProgressBar extends Thread {

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

				String progress ="\r";
				int column = (int) (progressPercentage * barLength);
				for(int j=0; j<=column;j++) {
					progress+=("*");
				}

				System.out.print(progress + anim.charAt(i++ % anim.length()));

				try {

					Thread.sleep(10);

				} catch (Exception e) {
					// do nothing
				}// END: try-catch

			}// END: while

		}// END: run

		public void setShowProgress(boolean showProgress) {
			this.showProgress = showProgress;
		}

		public void setProgressPercentage(double progressPercentage) {
			this.progressPercentage = progressPercentage;
		}
	}// END: class

}// END: class
