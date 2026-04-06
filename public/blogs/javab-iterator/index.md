## 一、核心概念

迭代器（Iterator）是 Java 中用于遍历集合（如 List、Set）的工具，本质是一个接口，定义了遍历集合的标准方法，无需关心集合的底层实现（数组、链表等），统一遍历逻辑。

核心作用：替代 for 循环（尤其适合未知集合类型、无法通过索引遍历的集合，如 Set），简化遍历代码，同时保证遍历过程中集合操作的安全性。

注意：迭代器仅用于 **遍历集合**，不能直接操作集合（如添加、删除元素，需通过迭代器自身方法）。

## 二、核心接口与常用方法

Java.util.Iterator 接口，常用方法（必记，蓝桥杯高频）：

- **hasNext()**：boolean 类型，判断集合中是否还有下一个元素（核心，遍历的终止条件）。
    
- **next()**：返回集合中的下一个元素，同时将迭代器指针向后移动一位（注意：必须先调用 hasNext() 判断，否则会抛出 NoSuchElementException）。
    
- **remove()**：删除迭代器当前指向的元素（唯一安全的、在遍历中删除集合元素的方式，避免 ConcurrentModificationException 异常）。
    

## 三、使用步骤（固定模板，直接套用）

1. 获取集合的迭代器对象：通过集合的 `iterator()` 方法获取（所有 Collection 接口的实现类都有该方法）。
    
2. 通过 `hasNext()` 判断是否有下一个元素。
    
3. 通过 `next()` 获取下一个元素，执行遍历操作。
    
4. （可选）通过 `remove()` 删除当前元素（需在 next() 之后调用）。
    

## 四、蓝桥杯常用实例（直接复制使用）

### 实例1：遍历 List 集合（最常用）

```java
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

public class IteratorDemo {
    public static void main(String[] args) {
        List<String> list = new ArrayList<>();
        list.add("蓝桥杯");
        list.add("Java");
        list.add("迭代器");
        
        // 1. 获取迭代器
        Iterator<String> it = list.iterator();
        
        // 2. 遍历
        while (it.hasNext()) {
            // 3. 获取下一个元素
            String str = it.next();
            System.out.println(str);
            
            // 可选：删除元素（例：删除包含"蓝桥杯"的元素）
            if (str.equals("蓝桥杯")) {
                it.remove(); // 只能在 next() 后调用，不能直接调用
            }
        }
        
        System.out.println("删除后的集合：" + list); // 输出：[Java, 迭代器]
    }
}
```

### 实例2：遍历 Set 集合（Set 无索引，必须用迭代器/增强for）

```java
import java.util.HashSet;
import java.util.Iterator;
import java.util.Set;

public class IteratorSetDemo {
    public static void main(String[] args) {
        Set<Integer> set = new HashSet<>();
        set.add(1);
        set.add(2);
        set.add(3);
        
        Iterator<Integer> it = set.iterator();
        while (it.hasNext()) {
            Integer num = it.next();
            System.out.println(num); // 输出顺序不固定（HashSet 无序）
        }
    }
}
```

## 五、蓝桥杯高频注意事项（避坑关键）

1. 必须先调用 hasNext()，再调用 next()：若直接调用 next()，当集合无元素时，会抛出 NoSuchElementException（蓝桥杯常考异常点）。

2. 遍历中删除元素，必须用迭代器的 remove()：不能用集合的 remove() 方法（如 list.remove(str)），否则会抛出 ConcurrentModificationException（并发修改异常）。

3. remove() 只能调用一次 per next()：每次 next() 后，只能调用一次 remove()，多次调用会抛出 IllegalStateException。

4. 迭代器是“单向的”：只能从前往后遍历，不能回溯（无法回到上一个元素）。

5. 增强for循环与迭代器的关系：增强for循环（for-each）本质是迭代器的简化写法，底层还是用 Iterator 实现，因此遍历中也不能直接修改集合。

## 六、蓝桥杯考点总结

1. 迭代器的核心方法（hasNext()、next()）是必考点，常结合集合遍历出题。

2. 遍历中删除元素的场景（用 it.remove()）是高频坑点，务必记住。

3. 适用场景：当题目给出的集合是 Set（无索引），或不确定集合类型时，优先用迭代器遍历。