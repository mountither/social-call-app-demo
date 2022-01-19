package com.callapp;
import com.facebook.react.ReactActivityDelegate;
import io.wazo.callkeep.RNCallKeepModule; 
import com.facebook.react.ReactActivity;

public class MainActivity extends ReactActivity {

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  @Override
  protected String getMainComponentName() {
    return "CallApp";
  }

  // Permission results - rn keep call
  @Override
  public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
      super.onRequestPermissionsResult(requestCode, permissions, grantResults);

      if (grantResults.length > 0) {
          switch (requestCode) {
              case RNCallKeepModule.REQUEST_READ_PHONE_STATE:
                  RNCallKeepModule.onRequestPermissionsResult(requestCode, permissions, grantResults);
                  break;
          }
      }
  }
}
