import { useFileContext } from '../contexts/FileContext';

/**
 * Reads all the file within current context, and then dispaly them in texts
 * Will have a copy button else where
 */
export default function Viewer() {
  const { content } = useFileContext();

  return (
    <div className="w-full h-full p-8 overflow-scroll">
      <pre className="whitespace-pre-wrap">{content}</pre>
      {/* <pre>
        Lorem ip sum dolor sit amet, consectetur adipiscing eli
        <br />
        t. Sed do eiusmod tempor incididunt ut la
        <br />
        ore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
        exercitation ullamco <br />
        laboris nisi ut aliquip ex ea commodo consequat. Duis aute <br />
        irure dolor in reprehenderit in voluptate velit esse c<br />
        illum dolore eu fugiat nulla <br />
        pariatur. Excepteur sint occaecat cupi
        <br />
        datat non proident, sunt in culpa qui officia deserunt mollit anim i
        <br />d est laborum. Lorem <br />
        ipsum dolor sit amet, consectetur a<br />
        dipiscing elit. Se
        <br />d <br />
        do eiusmod tempor incidi
        <br />
        dunt ut labore et dolore magna aliqua. Ut enim a<br />d minim veniam,
        quis nostrud exercitation ullamco laboris nisi ut aliquip ex <br />
        ea commo
        <br />
        do consequat. Duis aute irure dolor in reprehen
        <br />
        derit in voluptate velit esse c<br />
        illum <br />
        dolore eu fugiat nulla <br />
        pariatur. Excepteur sint occaecat cupi
        <br />
        datat non proi
        <br />
        dent, sunt in culpa qui officia deserunt mollit anim i<br />d est
        laborum. Lorem <br />
        ipsum dolor sit amet, consectetur ad
        <br />
        ipiscing elit. Sed <br />
        do eiusmod tempor incididunt ut labore et <br />
        dolore magna aliqua. Ut enim a<br />d minim veniam, quis nostrud
        exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.{' '}
        <br />
        Duis aute irure dolor in reprehen
        <br />
        derit in voluptate velit esse cillum <br />
        dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupi
        <br />
        datat non proident, sunt in culpa qui officia <br />
        deserunt mollit anim id est laborum. Lorem <br />
        ipsum dolor sit amet, <br />
        consectetur ad
        <br />
        ipiscing elit. Sed do eiusmod <br />
        tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim{' '}
        <br />
        veniam, quis nostru
        <br />d exercitation ullamco laboris nisi ut aliquip ex ea commo
        <br />
        do consequat. Duis aute irure dolor in reprehen
        <br />
        derit in voluptate velit esse <br />
        cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupi
        <br />
        datat non proident, sunt in culpa qui officia deserunt mollit anim id
        est laborum. Lorem <br />
        ipsum <br />
        dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
        incididunt ut labore et dolore magna aliqua. Ut enim a<br />d <br />
        minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliqu
        <br />
        ip ex ea commodo consequat. <br />
        Duis aute irure dolor in reprehen
        <br />
        derit in voluptate velit esse cillum dolo
        <br />
        re eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non p
        <br />
        roident, sunt in culpa qui officia deserunt mollit anim id est laborum.{' '}
        <br />
        Lorem ipsum dolor sit amet, consectetur ad
        <br />
        ipiscing elit. Sed do eiusmod tempor <br />
        incididunt ut labore et dolore magna aliqua. Ut <br />
        enim ad minim veniam, <br />
        quis nostrud exercitatio
        <br />n ullamco laboris nisi ut aliqu
        <br />
        ip ex ea commodo consequ
        <br />
        at. Duis aute irure dolor in rep
        <br />
        rehenderit in <br />
        voluptate velit esse cillum dolore eu <br />
        fugiat nulla pariatur. <br />
        Excepteur sint occaecat cupidata
        <br />t non proident, sunt in culpa qui o<br />
        fficia deserunt mollit anim id est laborum. Lorem <br />
        ipsum dolor sit amet, consectetur ad
        <br />
        ipiscing elit.
        <br /> Sed do eiusmod tempor incididunt ut labore e<br />t dolore magna
        aliqua. Ut enim
        <br /> ad minim veniam, quis nostrud exercitation ullamco laboris nisi
        ut aliqu
        <br />
        ip ex ea commodo consequat. Duis au
        <br />
        te irure dolor in reprehen
        <br />
        derit in voluptate ve
        <br />
        lit esse cillum dolore eu fug
        <br />
        iat nulla pariatur. Excepteur sint occaecat cupidatat non proi
        <br />
        dent, sunt in culpa qui <br />
        officia deserunt mollit anim id est laborum. Lorem <br />
        ipsum dolor sit amet, consectetur ad
        <br />
        ipiscing elit. Sed do eiusmod tempor
        <br /> incididunt ut labore et dolore magna aliqua. Ut enim ad mi
        <br />
        nim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex
        ea commodo consequat. Duis aute irure dolor in reprehenderit in vo
        <br />
        luptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur
        sint occaecat cupidatat n<br />
        on proident, sunt in culpa qui offic
        <br />
        ia deserunt mollit anim id est laborum.
      </pre> */}
    </div>
  );
}
