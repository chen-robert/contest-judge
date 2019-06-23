import java.util.*;
import java.io.*;

public class HelloWorld {
  public static void main(String args[]) {
    Scanner in = new Scanner(System.in);
    PrintStream out = System.out;
    
    out.println("Hello W0rld!");
    
    out.close();
    in.close();
  }
}