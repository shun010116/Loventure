import Link from 'next/link';

export default function Home() {
  return (
    <div>

        <form method="POST" className="register">
            
            <table className="table-register">
            <tbody>
                <tr>
                    <th><h2>로그인</h2></th>
                </tr>
                <tr><td>
                    <div>&nbsp;&nbsp;이메일</div>
                    <input type="text" className="text-register" name="username"></input>
                </td></tr>

                <tr><td>
                    <div>&nbsp;&nbsp;비밀번호</div>
                    <input type="password" className="text-register" name="password"></input>
                </td></tr>

                <tr><th>
                    <input type="submit" value="로그인" className="btn-register"></input>
                </th></tr>
            </tbody>
            </table>
            <Link href="/register">register</Link>
            
        </form>    
    </div>
  );
}
