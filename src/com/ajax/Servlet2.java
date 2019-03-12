package com.ajax;

import net.sf.json.JSONArray;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;
import java.sql.*;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@WebServlet(name = "Servlet2",urlPatterns = "/com.ajax/Servlet2")
public class Servlet2 extends HttpServlet {
    private static List convertList(ResultSet rs) throws SQLException {

        List list = new ArrayList();
        ResultSetMetaData md = rs.getMetaData();
        int columnCount = md.getColumnCount();
        while (rs.next()) {
            Map rowData = new HashMap();
            for (int i = 1; i <= columnCount; i++) {
                rowData.put(md.getColumnName(i), rs.getObject(i));
            }
            list.add(rowData);
        }
        return list;
    }
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

        request.setCharacterEncoding("UTF-8");

        Connection ct = null;  //コネクションオブジェクト(java.sql)
        Statement sm = null; //ステートメントオブジェクト(java.sql)
        ResultSet rs = null;   //リザルトセットオブジェクト(java.sql)


        //エラー番号
        int intErrNo = 0;
        //メッセージ
        String strMsg = "";
        try {
            //データベース処理
            //①ドライバ読み込み
            Class.forName("com.mysql.cj.jdbc.Driver");
            //接続情報
            String strDBinfo = "";
            //接続ユーザ
            String strUser = "";
            //パスワード
            String strPasswd = "";
            //②コネクション作成（ドライバマネージャオブジェクトを使う）
            ct = DriverManager.getConnection(strDBinfo,strUser,strPasswd);
            //③ステートメント作成
            sm = ct.createStatement();
            //SQL定義




            String sql = "select id,lat,lng,name from 出口表;";
            rs = sm.executeQuery(sql);
            JSONArray jsonData = JSONArray.fromObject(convertList(rs));
            System.out.println(jsonData.toString());

            PrintWriter out = response.getWriter();    //把json数据传递到前端，前端用ajax接收
            out.print(jsonData);


        }//try終了
        catch (SQLException e)  //データベース関連の例外を処理　
        {
            //エラー番号設定
            intErrNo = e.getErrorCode();
            strMsg = e.getMessage();

            System.out.println("Err;" + intErrNo + ";" + strMsg);
        }
        catch (Exception e)
        {
            //エラー番号設定
            intErrNo = e.hashCode();
            strMsg = e.getMessage();

            System.out.println("Err;" + intErrNo + ";" + strMsg);
        }
        finally {
            //データベースの後処理
            //クローズ処理
            //リザルトセットのクローズ
            if (rs != null){
                try {
                    rs.close();
                }catch (SQLException e){
                    e.printStackTrace();
                }
            }
            //ステートメントのクローズ
            if (sm != null){
                try {
                    sm.close();
                }catch (SQLException e){
                    e.printStackTrace();
                }
            }
            //コネクションのクローズ
            if (ct != null){
                try {
                    ct.close();
                }catch (SQLException e){
                    e.printStackTrace();
                }
            }
        }//finallyの終わり
    }

    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

    }
}
