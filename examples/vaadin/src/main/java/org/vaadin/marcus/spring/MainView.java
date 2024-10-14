package org.vaadin.marcus.spring;

import com.vaadin.flow.component.Component;
import com.vaadin.flow.component.Tag;
import com.vaadin.flow.component.button.Button;
import com.vaadin.flow.component.dependency.JavaScript;
import com.vaadin.flow.component.html.H1;
import com.vaadin.flow.component.orderedlayout.VerticalLayout;
import com.vaadin.flow.router.Route;

@Route
@JavaScript("https://tst.dynamsoft.com/libs/dwt/15.0/dynamsoft.webtwain.min.js")
@JavaScript("frontend://src/scan.js")
public class MainView extends VerticalLayout {
  public MainView() {
    Button addButton = new Button("Scan");
    addButton.addClickListener(click -> {
      getUI().get().getPage().executeJavaScript("AcquireImage()");
    });
    Button initButton = new Button("Load Scan Module");
    initButton.addClickListener(click -> {
      getUI().get().getPage().executeJavaScript("loadDWT()");
      add(new VerticalLayout(addButton, new WebTWAINContainer()));
    });

    add(new H1("Vaadin Dynamic Web TWAIN"), new VerticalLayout(initButton));
  }

  @Tag("div")
  public static class WebTWAINContainer extends Component {
    public WebTWAINContainer() {
      getElement().setProperty("id", "dwtcontrolContainer");
    }
  }
}
