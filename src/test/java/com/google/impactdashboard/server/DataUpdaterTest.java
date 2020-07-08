package com.google.impactdashboard.server;

import com.google.impactdashboard.database_manager.data_read.DataReadManager;
import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.JUnit4;
import org.mockito.Mockito;

import javax.xml.crypto.Data;
import java.io.IOException;

@RunWith(JUnit4.class)
public class DataUpdaterTest extends Mockito {

  private DataUpdater updater;

  @Before
  public void setup() throws IOException {
    updater = DataUpdater.create();
  }

  @Test
  public void logRetrieveTest() {
    updater.updateDatabase();

    Assert.assertEquals(1,1);
  }
}
