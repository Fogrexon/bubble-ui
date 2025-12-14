export type StrictStyleProperty = {
    fontFamily: string;
    fontSize: string;
    fontWeight: string;
    fontStyle: string;
    font: string;

    color: string;
    textAlign: string;

    backgroundColor: string;
    brackgroundImage: string;
    background: string;

    borderRadius: string;
    
    borderColor: string;
    borderWidth: string;
    borderStyle: string;
    border: string;

    padding: string;
    margin: string;
    width: string;
    height: string;

    position: string;
    top: string;
    left: string;
    right: string;
    bottom: string;
    flexDirection: string;
    justifyContent: string;
    alignItems: string;
    flexWrap: string;
}

export type StyleProperty = Partial<StrictStyleProperty>